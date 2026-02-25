UUID = hide-top-bar@alexekdahl
INSTALL_DIR = $(HOME)/.local/share/gnome-shell/extensions/$(UUID)

.PHONY: install uninstall schemas

schemas:
	glib-compile-schemas $(UUID)/schemas/

install: schemas
	mkdir -p $(INSTALL_DIR)
	cp -r $(UUID)/* $(INSTALL_DIR)/

uninstall:
	rm -rf $(INSTALL_DIR)
