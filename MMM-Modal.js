/**
 * @file MMM-Modal.js
 *
 * @author fewieden
 * @license MIT
 *
 * @see  https://github.com/fewieden/MMM-Modal
 */

/* global Module Log */

/**
 * @external Module
 * @see https://github.com/MichMich/MagicMirror/blob/master/js/module.js
 */

/**
 * @external Log
 * @see https://github.com/MichMich/MagicMirror/blob/master/js/logger.js
 */

/**
 * @module MMM-Modal
 * @description Frontend of the MagicMirror² module.
 *
 * @requires external:Module
 * @requires external:Log
 */
Module.register('MMM-Modal', {
    /**
     * @member {Object} defaults - Defines the default config values.
     * @property {boolean|number} timer - Flag to disable timer or seconds to show modal.
     * @property {boolean} touch - Flag to en-/disable touch support.
     * @property {boolean} showModuleName - Flag to show/hide the module name of the modal.
     */
    defaults: {
        timer: 15 * 1000,
        touch: false,
        showModuleName: true
    },

    /**
     * @member {string} defaultTemplate - Path to fallback of inner modal template.
     */
    defaultTemplate: 'templates/InnerTemplate.njk',

    /**
     * @member {object|null} modal - Modal with template path, data and options.
     * @property {string} template - Path to modal template.
     * @property {string} senderName - Name of the module which sent the modal.
     * @property {object} data - Dynamic values for displaying in the modal.
     * @property {object} options - Options for displaying in the modal.
     */
    modal: null,

    /**
     * @member {Object} voice - Defines the default mode and commands of this module.
     * @property {string} mode - Voice mode of this module.
     * @property {string[]} sentences - List of voice commands of this module.
     */
    voice: {
        mode: 'MODAL',
        sentences: [
            'OPEN HELP',
            'CLOSE HELP',
            'CLOSE MODAL',
            'CANCEL MODAL',
            'CONFIRM MODAL',
        ]
    },

    /**
     * @function createTimer
     * @description Creates a timeout to close modal after specified time.
     *
     * @returns {void}
     */
    createTimer() {
        if (this.config.timer) {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => this.closeModal(false), this.config.timer);
        }
    },

    /**
     * @function suspend
     * @description Closes the current modal when the module gets suspended.
     * @override
     */
    suspend() {
        this.closeModal(false);
        Log.log(`${this.name} is suspended.`);
    },

    /**
     * @function notificationReceived
     * @description Handles incoming broadcasts from other modules or the MagicMirror² core.
     * @override
     *
     * @param {string} notification - Notification name
     * @param {*} payload - Detailed payload of the notification.
     * @param {Object} sender - Module that sent the notification or undefined for MagicMirror² core.
     */
    notificationReceived(notification, payload, sender) {
        if (notification === 'ALL_MODULES_STARTED') {
            this.sendNotification('REGISTER_VOICE_MODULE', this.voice);
        } else if (notification === `VOICE_${this.voice.mode}` && sender.name === 'MMM-voice') {
            this.handleModals(payload);
        } else if (notification === 'VOICE_MODE_CHANGED' && sender.name === 'MMM-voice'
            && payload.old === this.voice.mode) {
            this.closeModal(false);
        } else if (notification === 'OPEN_MODAL') {
            this.handleModals(notification, payload, sender);
        } else if (this.isDialogAction(notification, sender)) {
            this.handleModals(notification, payload, sender);
        } else if (notification === 'CLOSE_MODAL' || notification === 'DOM_OBJECTS_CREATED') {
            this.closeModal(false);
        }
    },

    /**
     * @function isDialogAction
     * @description Checks if the modal contains a dialog action and the sender is owner of the modal.
     *
     * @param {string} notification - Notification received from other module.
     * @param {string} sender - Module which send the notification.
     *
     * @returns {boolean} Is the notification a valid dialog action?
     */
    isDialogAction(notification, sender) {
        const identifier = sender ? sender.identifier : this.identifier;

        return this.modal && identifier === this.modal.identifier && this.modal.options && this.modal.options.isDialog === true
            && (notification === 'CANCEL_MODAL' || notification === 'CONFIRM_MODAL');
    },

    /**
     * @function getStyles
     * @description Style dependencies for this module.
     * @override
     *
     * @returns {string[]} List of the style dependency filepaths.
     */
    getStyles() {
        return [`${this.name}.css`];
    },

    /**
     * @function getTranslations
     * @description Translations for this module.
     * @override
     *
     * @returns {Object.<string, string>} Available translations for this module (key: language code, value: filepath).
     */
    getTranslations() {
        return {
            en: 'translations/en.json',
            de: 'translations/de.json'
        };
    },

    /**
     * @function getTemplate
     * @description Nunjuck template.
     * @override
     *
     * @returns {string} Path to nunjuck template.
     */
    getTemplate() {
        return `${this.name}/templates/${this.name}.njk`;
    },

    /**
     * @function getTemplateData
     * @description Data that gets rendered in the nunjuck template.
     * @override
     *
     * @returns {object} Data for the nunjuck template.
     */
    getTemplateData() {
        const senderName = this.modal.template ? this.modal.senderName : this.name;

        let innerTemplate = this.defaultTemplate;
        if (this.modal.template) {
            innerTemplate = `${senderName}/${this.modal.template}`;
        }

        return {
            innerTemplate,
            senderName,
            config: this.config,
            data: this.modal.data,
            options: this.modal.options
        };
    },

    /**
     * @function handleModals
     * @description Hide/show modals based on voice commands or module notifications.
     *
     * @param {string} command - Command for open and closing the modal.
     * @param {*} payload - Detailed payload of the notification.
     * @param {object} sender - Contains name and identifier of the module, which sent the command.
     *
     * @returns {void}
     */
    handleModals(command, payload, sender) {
        if (/CLOSE/g.test(command) && !/OPEN/g.test(command)) {
            this.closeModal(false);
        } else if (/CANCEL/g.test(command) && !/CONFIRM/g.test(command)) {
            this.closeModal(false);
        } else if (/CONFIRM/g.test(command) && !/CANCEL/g.test(command)) {
            this.closeModal(true);
        } else if (/OPEN/g.test(command) && !/CLOSE/g.test(command)) {
            if (this.modal) {
                this.closeModal(false);
            }

            let modal = payload;

            if (!sender) {
                modal = {
                    identifier: this.identifier,
                    senderName: this.name,
                    template: 'templates/HelpModal.njk',
                    data: this.voice,
                    options: {}
                }
            } else {
                modal.senderName = sender.name;
                modal.identifier = sender.identifier;
                modal.options = modal.options || {};
                modal.data = modal.data || {};
            }

            this.modal = modal;

            this.openModal();
        }
    },

    /**
     * @function nunjuckPath
     * @description Path to modules directory for nunjuck loader.
     *
     * @returns {string} File path.
     */
    nunjuckPath() {
        return this.data.path.replace(this.name, '').replace('//', '/');
    },

    /**
     * @function getDom
     * @description Generates the DOM of the module. Called by the MagicMirror² core.
     * @override
     *
     * @returns {Element} The DOM to display.
     */
    getDom() {
        const wrapper = document.createElement('div');

        if (!this.modal) {
            return wrapper;
        }

        this.nunjucksEnvironment().render(this.getTemplate(), this.getTemplateData(), (err, res) => {
            wrapper.innerHTML = res;

            if (this.config.touch) {
                const actions = [
                    { name: 'close', confirmed: false },
                    { name: 'cancel', confirmed: false },
                    { name: 'confirm', confirmed: true },
                ];

                for (const { name, confirmed } of actions) {
                    const element = wrapper.querySelector(`.btn-${name}`);

                    if (element) {
                        element.addEventListener('click', () => {
                            this.closeModal(confirmed);
                        });
                    }
                }
            }

            if (this.modal.options.callback) {
                this.modal.options.callback(!err);
            }

            if (err) {
                Log.error(err)
                this.closeModal(false);
            }
        });

        return wrapper;
    },

    /**
     * @function file
	 * @description Retrieve the path to a module file.
     * @override
     *
     * @param {string} file - File name
     *
     * @returns {string} File path.
	 */
    file(file) {
        if (file === '') {
            return this.nunjuckPath();
        }

        return `${this.data.path}/${file}`.replace('//', '/');
    },

    /**
     * @function openModal
     * @description Displays the modal.
     *
     * @returns {void}
     */
    openModal() {
        this.createTimer();
        this.toggleBlur();
        this.updateDom(0);
        this.show(300, {lockString: this.identifier});
    },

    /**
     * @function closeModal
     * @description Close the current modal.
     *
     * @param {boolean} confirmed - Was the dialog of the modal confirmed or not.
     *
     * @returns {void}
     */
    closeModal(confirmed) {
        if (!this.modal) {
            return;
        }

        if (this.modal.identifier !== this.identifier) {
            this.sendNotification('MODAL_CLOSED', {
                identifier: this.modal.identifier,
                confirmed
            });
        }

        clearTimeout(this.timer);
        this.modal = null;
        this.hide(300, {lockString: this.identifier});
        this.updateDom(0);
        this.toggleBlur();
    },

    /**
     * @function toggleBlur
     * @description Toggles blur over all modules. The DOM is addressed directly.
     *
     * @returns {void}
     */
    toggleBlur() {
        const modules = document.querySelectorAll('.module');
        for (let i = 0; i < modules.length; i += 1) {
            if (!modules[i].classList.contains('MMM-Modal')) {
                if (this.modal) {
                    modules[i].classList.add('MMM-Modal-blur');
                } else {
                    modules[i].classList.remove('MMM-Modal-blur');
                }
            }
        }
    }
});
