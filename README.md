# Hide Top Bar

A GNOME Shell extension that hides the top panel on specific workspaces, or all of them.

Works with GNOME 46.

## What it does

- Hide the top bar on individual workspaces (pick which ones in the preferences)
- Or just hide it everywhere with a single toggle
- The bar reappears when you open the Activities overview, so you're never locked out

## Install

```sh
make install
```

This compiles the GSettings schema and copies the extension to `~/.local/share/gnome-shell/extensions/`.

Then restart GNOME Shell (log out and back in on Wayland, or `Alt+F2` → `r` on X11) and enable the extension:

```sh
gnome-extensions enable hide-top-bar@alexekdahl
```

## Uninstall

```sh
make uninstall
```

## Configuration

Open the extension preferences through GNOME Extensions app, or:

```sh
gnome-extensions prefs hide-top-bar@alexekdahl
```

Two options:

- **Hide on all workspaces** — single toggle, does what it says
- **Per-workspace** — add workspace numbers to a list; the bar hides only on those workspaces

Per-workspace controls are disabled when the global toggle is on.
