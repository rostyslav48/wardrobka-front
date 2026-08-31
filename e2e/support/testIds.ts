/**
 * Every `testID` the app sets, mirrored here so the e2e suite never hardcodes
 * a selector string. The app spells these ids literally (it does not import
 * this file — it can't, it's outside the app bundle), so a grep for one of
 * the strings below finds both the assertion and the component that sets it.
 */
export const testIds = Object.freeze({
  login: Object.freeze({
    heading: 'login-heading',
    emailInput: 'login-email-input',
    passwordInput: 'login-password-input',
    nameInput: 'login-name-input',
    confirmPasswordInput: 'login-confirm-password-input',
    submitButton: 'login-submit-button',
    switchModeLink: 'login-switch-mode-link',
    forgotPasswordLink: 'login-forgot-password-link',
  }),
  forgotPassword: Object.freeze({
    heading: 'forgot-password-heading',
    submitButton: 'forgot-password-submit-button',
  }),
  home: Object.freeze({
    greeting: 'home-greeting',
    greetingSubtitle: 'home-greeting-subtitle',
    recentSuggestionsHeader: 'home-recent-suggestions-header',
    askWardropkaHeader: 'home-ask-wardropka-header',
  }),
  tabs: Object.freeze({
    home: 'tab-home',
    items: 'tab-items',
    chat: 'tab-chat',
    log: 'tab-log',
    settings: 'tab-settings',
  }),
  screens: Object.freeze({
    items: 'items-screen',
    chat: 'chat-screen',
    log: 'log-screen',
    settings: 'settings-screen',
  }),
});
