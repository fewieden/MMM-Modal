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
     */
    defaults: {
        timer: false
    },

    /**
     * @member {boolean} active - Flag that indicates if there is currently a modal displayed.
     */
    active: false,

    /**
     * @member {string} defaultTemplate - Path to fallback of inner modal template.
     */
    defaultTemplate: 'MMM-Modal/InnerTemplate.njk',

    /**
     * @member {string|null} pathTemplate - Path to inner modal template.
     */
    innerTemplate: null,

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
            'CLOSE MODAL'
        ]
    },

    /**
     * @function createFetchInterval
     * @description Creates an interval to fetch standings periodically.
     */
    createTimer() {
        if (this.config.timer) {
            this.timer = setTimeout(this.closeModal, this.config.timer);
        }
    },

    /**
     * @function suspend
     * @description Clears the fetch interval when the module gets suspended, to avoid request to the API.
     * @override
     */
    suspend() {
        this.closeModal();
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
            this.closeModal();
        } else if (notification === 'OPEN_MODAL') {
            this.handleModals(notification, payload, sender ? sender.name : null);
        } else if (notification === 'CLOSE_MODAL') {
            this.closeModal();
        }
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
        return `${this.name}/${this.name}.njk`;
    },

    /**
     * @function getTemplateData
     * @description Data that gets rendered in the nunjuck template.
     * @override
     *
     * @returns {string} Data for the nunjuck template.
     */
    getTemplateData() {
        return {
            template: this.innerTemplate || this.defaultTemplate,
            data: this.modalData
        };
    },

    /**
     * @function handleModals
     * @description Hide/show modules based on voice commands or module notifications.
     *
     * @param {string} command - Command for open and closing the modal.
     * @param {*} payload - Detailed payload of the notification.
     * @param {object} senderName - Name of the module that sent the command.
     */
    handleModals(command, payload, senderName) {
        if (/CLOSE/g.test(command) && !/OPEN/g.test(command)) {
            this.closeModal();
        } else if (/OPEN/g.test(command) && !/CLOSE/g.test(command)) {
            let modal = payload;

            if (!senderName) {
                modal = {
                    template: `${this.name}/HelpModal.njk`,
                    data: this.voice
                }
            } else {
                modal.template = `${senderName}/${modal.template}`;
            }

            this.openModal(modal);
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
     * @function file
	 * @description Retrieve the path to a module file.
     * @override
     *
     * @param {string} file - File name
     *
     * @returns {string} File path.
	 */
    file: function (file) {
        if (file === '') {
            return this.nunjuckPath();
        }

        return (`${this.data.path}/${file}`).replace('//', '/');
    },

    /**
     * @function openModal
     * @description Sets and opens the modal.
     *
     * @param {object} modal - Modal object that should be displayed
     */
    openModal(modal) {
        this.active = true;
        this.toggleBlur();
        this.innerTemplate = modal.template;
        this.modalData = modal.data;
        this.updateDom(300);
    },

    /**
     * @function closeModal
     * @description Close the current modal.
     */
    closeModal() {
        if (!this.active) {
            return;
        }

        clearTimeout(this.timer);
        this.active = false;
        this.innerTemplate = null;
        this.modalData = null;
        this.toggleBlur();
        this.updateDom(300);
    },

    /**
     * @function toggleBlur
     * @description Toggles blur over all modules. The DOM is addressed directly.
     */
    toggleBlur() {
        const modules = document.querySelectorAll('.module');
        for (let i = 0; i < modules.length; i += 1) {
            if (!modules[i].classList.contains('MMM-Modal')) {
                if (this.active) {
                    modules[i].classList.add('MMM-Modal-blur');
                } else {
                    modules[i].classList.remove('MMM-Modal-blur');
                }
            }
        }
    }
});
