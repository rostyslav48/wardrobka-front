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
    // Renamed by the redesign (spec section 8.9): the three section headings
    // are section 4.3's eyebrow role and now render in capitals as
    // 'RECENT SUGGESTIONS', 'ASK WARDROPKA' and 'UPCOMING OCCASIONS'. The ids
    // did not change.
    recentSuggestionsHeader: 'home-recent-suggestions-header',
    askWardropkaHeader: 'home-ask-wardropka-header',
    occasionsHeader: 'home-occasions-header',
    occasionsDisconnected: 'home-occasions-disconnected',
    occasionsRevoked: 'home-occasions-revoked',
    occasionsEmpty: 'home-occasions-empty',
    seeAllSuggestions: 'home-see-all-suggestions',
  }),
  outfitHistory: Object.freeze({
    screen: 'outfit-history-screen',
    card: (id: string) => `outfit-suggestion-card-${id}`,
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
  settings: Object.freeze({
    // plan-12 phase 5: the daily-reminder switch and the "mention calendar
    // events" switch it gates, both in NotificationsSection.
    dailyReminderSwitch: 'settings-notifications-daily-switch',
    includeOccasionsSwitch: 'settings-notifications-include-occasions-switch',
  }),
  item: Object.freeze({
    photoPicker: 'item-photo-picker',
    photoAnalyzing: 'item-photo-analyzing',
    analysisMessage: 'item-analysis-message',
    nameInput: 'item-name-input',
    brandInput: 'item-brand-input',
    submitButton: 'item-submit-button',
    generateImageToggle: 'item-generate-image-toggle',
    cardGenerating: 'item-card-generating',
    cardFailed: 'item-card-failed',
    cardRetry: 'item-card-retry',
    cardPickPhoto: 'item-card-pick-photo',
    detailImageFailed: 'item-detail-image-failed',
    detailRetry: 'item-detail-retry',
    detailPickPhoto: 'item-detail-pick-photo',
    colorSwatch: (label: string) => `item-color-swatch-${label}`,
  }),
});
