import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class HideTopBarPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: 'General',
            icon_name: 'preferences-desktop-display-symbolic',
        });
        window.add(page);

        // Hide on all workspaces
        const globalGroup = new Adw.PreferencesGroup({
            title: 'Global',
        });
        page.add(globalGroup);

        const hideAllRow = new Adw.SwitchRow({
            title: 'Hide on all workspaces',
            subtitle: 'Hide the top bar on every workspace',
        });
        settings.bind('hide-on-all', hideAllRow, 'active', 0);
        globalGroup.add(hideAllRow);

        // Per-workspace configuration
        const workspacesGroup = new Adw.PreferencesGroup({
            title: 'Per-Workspace',
            description: 'Choose which workspaces hide the top bar',
        });
        page.add(workspacesGroup);

        // Add workspace row
        const addGroup = new Adw.PreferencesGroup();
        page.add(addGroup);

        const addRow = new Adw.ActionRow({
            title: 'Workspace number',
            subtitle: 'Add a workspace to the hidden list (1-based)',
        });

        const spinButton = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 36,
                step_increment: 1,
                value: 1,
            }),
            valign: Gtk.Align.CENTER,
        });
        addRow.add_suffix(spinButton);

        const addButton = new Gtk.Button({
            icon_name: 'list-add-symbolic',
            valign: Gtk.Align.CENTER,
            css_classes: ['flat'],
        });
        addRow.add_suffix(addButton);
        addGroup.add(addRow);

        const rebuildList = () => {
            // Remove existing workspace rows
            let child = workspacesGroup.get_first_child();
            const toRemove = [];
            while (child) {
                // Skip the group header
                if (child instanceof Adw.ActionRow)
                    toRemove.push(child);
                child = child.get_next_sibling();
            }
            toRemove.forEach(r => workspacesGroup.remove(r));

            const hiddenWorkspaces = settings.get_value('hidden-workspaces').deepUnpack();
            const sorted = [...hiddenWorkspaces].sort((a, b) => a - b);

            if (sorted.length === 0) {
                const emptyRow = new Adw.ActionRow({
                    title: 'No workspaces configured',
                    subtitle: 'Add workspace numbers below',
                });
                workspacesGroup.add(emptyRow);
                return;
            }

            for (const idx of sorted) {
                const row = new Adw.ActionRow({
                    title: `Workspace ${idx + 1}`,
                });

                const removeBtn = new Gtk.Button({
                    icon_name: 'list-remove-symbolic',
                    valign: Gtk.Align.CENTER,
                    css_classes: ['flat'],
                });
                removeBtn.connect('clicked', () => {
                    const current = settings.get_value('hidden-workspaces').deepUnpack();
                    const updated = current.filter(i => i !== idx);
                    settings.set_value('hidden-workspaces', new GLib.Variant('ai', updated));
                });

                row.add_suffix(removeBtn);
                workspacesGroup.add(row);
            }
        };

        addButton.connect('clicked', () => {
            const wsIndex = spinButton.get_value_as_int() - 1;
            const current = settings.get_value('hidden-workspaces').deepUnpack();
            if (!current.includes(wsIndex)) {
                current.push(wsIndex);
                settings.set_value('hidden-workspaces', new GLib.Variant('ai', current));
            }
        });

        settings.connect('changed::hidden-workspaces', () => rebuildList());
        rebuildList();

        // Disable per-workspace controls when hide-on-all is active
        const updateSensitivity = () => {
            const hideAll = settings.get_boolean('hide-on-all');
            workspacesGroup.set_sensitive(!hideAll);
            addGroup.set_sensitive(!hideAll);
        };
        settings.connect('changed::hide-on-all', () => updateSensitivity());
        updateSensitivity();
    }
}
