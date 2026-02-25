import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class HideTopBarExtension extends Extension {
    _signals = [];
    _settings = null;
    _panelHeight = null;

    enable() {
        this._settings = this.getSettings();
        this._panelHeight = Main.panel.height;

        const wm = global.workspace_manager;

        this._connectSignal(wm, 'workspace-switched', () => this._updatePanelVisibility());
        this._connectSignal(Main.overview, 'showing', () => this._showPanel());
        this._connectSignal(Main.overview, 'hiding', () => this._updatePanelVisibility());
        this._connectSignal(this._settings, 'changed::hidden-workspaces', () => this._updatePanelVisibility());
        this._connectSignal(this._settings, 'changed::hide-on-all', () => this._updatePanelVisibility());

        this._updatePanelVisibility();
    }

    disable() {
        for (const { obj, id } of this._signals)
            obj.disconnect(id);
        this._signals = [];

        this._showPanel();

        this._settings = null;
        this._panelHeight = null;
    }

    _connectSignal(obj, signal, callback) {
        const id = obj.connect(signal, callback);
        this._signals.push({ obj, id });
    }

    _updatePanelVisibility() {
        if (Main.overview.visible) return;

        const activeIndex = global.workspace_manager.get_active_workspace().index();
        const hideOnAll = this._settings.get_boolean('hide-on-all');
        const hiddenWorkspaces = this._settings.get_value('hidden-workspaces').deepUnpack();

        if (hideOnAll || hiddenWorkspaces.includes(activeIndex))
            this._hidePanel();
        else
            this._showPanel();
    }

    _hidePanel() {
        Main.panel.hide();
        // Setting height to 0 collapses the panel's allocated space so
        // windows can use the full screen. hide() alone leaves a dead zone.
        Main.panel.height = 0;
    }

    _showPanel() {
        Main.panel.show();
        // -1 tells Clutter to recalculate natural height if we never captured it
        Main.panel.height = this._panelHeight ?? -1;
    }
}
