import { useEffect } from 'react';

/**
 * ScriptLoader component for injecting scripts and styles dynamically
 * This component can be imported in any page where you want to load specific scripts/styles
 */
const ScriptLoader = () => {
  useEffect(() => {
    // Function to create and inject script element
    const loadScript = (src, id = null, attrs = {}) => {
      // Check if script already exists to prevent duplicate loading
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) return;
      
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      if (id) {
        script.id = id;
      }
      
      // Add any additional attributes
      Object.keys(attrs).forEach(key => {
        script.setAttribute(key, attrs[key]);
      });
      
      document.body.appendChild(script);
      
      return () => {
        // Cleanup function to remove script when component unmounts
        document.body.removeChild(script);
      };
    };

    // Function to create and inject style element
    const loadStyle = (href, id = null, attrs = {}) => {
      // Check if style already exists to prevent duplicate loading
      const existingStyle = document.querySelector(`link[href="${href}"]`);
      if (existingStyle) return;
      
      const link = document.createElement('link');
      link.href = href;
      link.rel = 'stylesheet';
      
      if (id) {
        link.id = id;
      }
      
      // Add any additional attributes like media
      Object.keys(attrs).forEach(key => {
        link.setAttribute(key, attrs[key]);
      });
      
      document.head.appendChild(link);
      
      return () => {
        // Cleanup function to remove style when component unmounts
        document.head.removeChild(link);
      };
    };

    // Function for creating script with inline content
    const createInlineScript = (content, id = null) => {
      const script = document.createElement('script');
      script.textContent = content;
      
      if (id) {
        script.id = id;
      }
      
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    };
    
    // Load the original scripts
    const azimJsCleanup = loadScript('/azim.js');
    const azimCssCleanup = loadStyle('/azim.css');
    
    // Load all style elements from scripts.html
    const styleCleanups = [];
    
    // Head stylesheets
    styleCleanups.push(loadStyle('/wp-content/plugins/header-footer-elementor/inc/widgets-css/frontenda1ec.css?ver=2.3.0', 'hfe-widgets-style-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/jeg-elementor-kit/assets/css/elements/mainf4f2.css?ver=2.6.12', 'jkit-elements-main-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/template-kit-export/assets/public/template-kit-export-public982a.css?ver=1.0.23', 'template-kit-export-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/header-footer-elementor/assets/css/header-footer-elementora1ec.css?ver=2.3.0', 'hfe-style-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/css/frontend.min89ce.css?ver=3.28.4', 'elementor-frontend-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/uploads/sites/13/elementor/css/post-106d53.css?ver=1743224192', 'elementor-post-10-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/css/widget-icon-list.min89ce.css?ver=3.28.4', 'widget-icon-list-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/lib/animations/styles/fadeInRight.min89ce.css?ver=3.28.4', 'e-animation-fadeInRight-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/lib/animations/styles/fadeInLeft.min89ce.css?ver=3.28.4', 'e-animation-fadeInLeft-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/css/widget-image.min89ce.css?ver=3.28.4', 'widget-image-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/lib/animations/styles/fadeInUp.min89ce.css?ver=3.28.4', 'e-animation-fadeInUp-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/css/conditionals/shapes.min89ce.css?ver=3.28.4', 'e-shapes-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/css/widget-heading.min89ce.css?ver=3.28.4', 'widget-heading-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-includes/js/mediaelement/mediaelementplayer-legacy.min1f61.css?ver=4.2.17', 'mediaelement-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-includes/js/mediaelement/wp-mediaelement.min0899.css?ver=6.8.1', 'wp-mediaelement-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/lib/swiper/v8/css/swiper.min94a4.css?ver=8.4.5', 'swiper-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/css/conditionals/e-swiper.min89ce.css?ver=3.28.4', 'e-swiper-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/css/widget-image-carousel.min89ce.css?ver=3.28.4', 'widget-image-carousel-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/css/widget-counter.min89ce.css?ver=3.28.4', 'widget-counter-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/css/widget-social-icons.min89ce.css?ver=3.28.4', 'widget-social-icons-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/css/conditionals/apple-webkit.min89ce.css?ver=3.28.4', 'e-apple-webkit-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/lib/animations/styles/e-animation-shrink.min89ce.css?ver=3.28.4', 'e-animation-shrink-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/css/widget-rating.min89ce.css?ver=3.28.4', 'widget-rating-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/uploads/sites/13/elementor/css/post-51fd5.css?ver=1743224233', 'elementor-post-5-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/uploads/sites/13/elementor/css/post-416d53.css?ver=1743224192', 'elementor-post-41-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/uploads/sites/13/elementor/css/post-471b23.css?ver=1743224193', 'elementor-post-47-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/metform/public/assets/css/metform-uib526.css?ver=3.9.8', 'metform-ui-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/metform/public/assets/css/styleb526.css?ver=3.9.8', 'metform-style-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/metform/public/assets/lib/cute-alert/styleb526.css?ver=3.9.8', 'cute-alert-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/metform/public/assets/css/text-editorb526.css?ver=3.9.8', 'text-editor-style-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/themes/hello-elementor/style.min9b70.css?ver=3.3.0', 'hello-elementor-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/themes/hello-elementor/theme.min9b70.css?ver=3.3.0', 'hello-elementor-theme-style-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/themes/hello-elementor/header-footer.min9b70.css?ver=3.3.0', 'hello-elementor-header-footer-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/lib/eicons/css/elementor-icons.min705c.css?ver=5.34.0', 'hfe-elementor-icons-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/css/widget-icon-list.min44b4.css?ver=3.24.3', 'hfe-icons-list-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/css/widget-social-icons.min2401.css?ver=3.24.0', 'hfe-social-icons-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/lib/font-awesome/css/brands52d5.css?ver=5.15.3', 'hfe-social-share-icons-brands-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/lib/font-awesome/css/fontawesome52d5.css?ver=5.15.3', 'hfe-social-share-icons-fontawesome-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/lib/font-awesome/css/solid52d5.css?ver=5.15.3', 'hfe-nav-menu-icons-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementskit-lite/widgets/init/assets/css/widget-styles3b71.css?ver=3.5.0', 'ekit-widget-styles-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementskit-lite/widgets/init/assets/css/responsive3b71.css?ver=3.5.0', 'ekit-responsive-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/uploads/sites/13/elementor/google-fonts/css/poppinsa792.css?ver=1743223584', 'elementor-gf-local-poppins-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementskit-lite/modules/elementskit-icon-pack/assets/css/ekiticons3b71.css?ver=3.5.0', 'elementor-icons-ekiticons-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/jeg-elementor-kit/assets/fonts/jkiticon/jkiticonf4f2.css?ver=2.6.12', 'elementor-icons-jkiticon-css', { media: 'all' }));
    
    // Body stylesheets
    styleCleanups.push(loadStyle('/wp-content/plugins/jeg-elementor-kit/lib/jeg-framework/assets/css/jeg-dynamic-styles6f3e.css?ver=1.3.0', 'jeg-dynamic-style-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/css/widget-icon-box.min89ce.css?ver=3.28.4', 'widget-icon-box-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/lib/font-awesome/css/all.min89ce.css?ver=3.28.4', 'font-awesome-5-all-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/elementor/assets/lib/font-awesome/css/v4-shims.min89ce.css?ver=3.28.4', 'font-awesome-4-shim-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/uploads/sites/13/elementor/css/post-3921fd5.css?ver=1743224233', 'elementor-post-392-css', { media: 'all' }));
    styleCleanups.push(loadStyle('/wp-content/plugins/metform/public/assets/css/flatpickr.minb526.css?ver=3.9.8', 'flatpickr-css', { media: 'all' }));
    
    // Load all script elements from scripts.html
    const scriptCleanups = [];
    
    scriptCleanups.push(loadScript('/wp-includes/js/jquery/jquery.minf43b.js?ver=3.7.1', 'jquery-core-js'));
    scriptCleanups.push(loadScript('/wp-includes/js/jquery/jquery-migrate.min5589.js?ver=3.4.1', 'jquery-migrate-js'));
    
    // Create inline script for mejsL10n
    const mejsL10nScript = createInlineScript(
      'var mejsL10n = { "language": "en", "strings": { "mejs.download-file": "Download File", "mejs.install-flash": "You are using a browser that does not have Flash player enabled or installed. Please turn on your Flash player plugin or download the latest version from https:\\/\\/get.adobe.com\\/flashplayer\\/", "mejs.fullscreen": "Fullscreen", "mejs.play": "Play", "mejs.pause": "Pause", "mejs.time-slider": "Time Slider", "mejs.time-help-text": "Use Left\\/Right Arrow keys to advance one second, Up\\/Down arrows to advance ten seconds.", "mejs.live-broadcast": "Live Broadcast", "mejs.volume-help-text": "Use Up\\/Down Arrow keys to increase or decrease volume.", "mejs.unmute": "Unmute", "mejs.mute": "Mute", "mejs.volume-slider": "Volume Slider", "mejs.video-player": "Video Player", "mejs.audio-player": "Audio Player", "mejs.captions-subtitles": "Captions\\/Subtitles", "mejs.captions-chapters": "Chapters", "mejs.none": "None", "mejs.afrikaans": "Afrikaans", "mejs.albanian": "Albanian", "mejs.arabic": "Arabic", "mejs.belarusian": "Belarusian", "mejs.bulgarian": "Bulgarian", "mejs.catalan": "Catalan", "mejs.chinese": "Chinese", "mejs.chinese-simplified": "Chinese (Simplified)", "mejs.chinese-traditional": "Chinese (Traditional)", "mejs.croatian": "Croatian", "mejs.czech": "Czech", "mejs.danish": "Danish", "mejs.dutch": "Dutch", "mejs.english": "English", "mejs.estonian": "Estonian", "mejs.filipino": "Filipino", "mejs.finnish": "Finnish", "mejs.french": "French", "mejs.galician": "Galician", "mejs.german": "German", "mejs.greek": "Greek", "mejs.haitian-creole": "Haitian Creole", "mejs.hebrew": "Hebrew", "mejs.hindi": "Hindi", "mejs.hungarian": "Hungarian", "mejs.icelandic": "Icelandic", "mejs.indonesian": "Indonesian", "mejs.irish": "Irish", "mejs.italian": "Italian", "mejs.japanese": "Japanese", "mejs.korean": "Korean", "mejs.latvian": "Latvian", "mejs.lithuanian": "Lithuanian", "mejs.macedonian": "Macedonian", "mejs.malay": "Malay", "mejs.maltese": "Maltese", "mejs.norwegian": "Norwegian", "mejs.persian": "Persian", "mejs.polish": "Polish", "mejs.portuguese": "Portuguese", "mejs.romanian": "Romanian", "mejs.russian": "Russian", "mejs.serbian": "Serbian", "mejs.slovak": "Slovak", "mejs.slovenian": "Slovenian", "mejs.spanish": "Spanish", "mejs.swahili": "Swahili", "mejs.swedish": "Swedish", "mejs.tagalog": "Tagalog", "mejs.thai": "Thai", "mejs.turkish": "Turkish", "mejs.ukrainian": "Ukrainian", "mejs.vietnamese": "Vietnamese", "mejs.welsh": "Welsh", "mejs.yiddish": "Yiddish" } };',
      'mediaelement-core-js-before'
    );
    
    scriptCleanups.push(loadScript('/wp-includes/js/mediaelement/mediaelement-and-player.min1f61.js?ver=4.2.17', 'mediaelement-core-js'));
    scriptCleanups.push(loadScript('/wp-includes/js/mediaelement/mediaelement-migrate.min0899.js?ver=6.8.1', 'mediaelement-migrate-js'));
    
    // Create inline script for _wpmejsSettings
    const wpmejsSettingsScript = createInlineScript(
      'var _wpmejsSettings = { "pluginPath": "\\/medzoon\\/wp-includes\\/js\\/mediaelement\\/", "classPrefix": "mejs-", "stretching": "responsive", "audioShortcodeLibrary": "mediaelement", "videoShortcodeLibrary": "mediaelement" };',
      'mediaelement-js-extra'
    );
    
    scriptCleanups.push(loadScript('/wp-includes/js/mediaelement/wp-mediaelement.min0899.js?ver=6.8.1', 'wp-mediaelement-js'));
    scriptCleanups.push(loadScript('/wp-content/plugins/elementor/assets/lib/swiper/v8/swiper.min94a4.js?ver=8.4.5', 'swiper-js'));
    scriptCleanups.push(loadScript('/wp-content/plugins/elementor/assets/lib/jquery-numerator/jquery-numerator.min3958.js?ver=0.2.1', 'jquery-numerator-js'));
    scriptCleanups.push(loadScript('/wp-content/plugins/metform/public/assets/js/htmb526.js?ver=3.9.8', 'htm-js'));
    scriptCleanups.push(loadScript('/wp-includes/js/dist/vendor/react.mine1ab.js?ver=18.3.1.1', 'react-js'));
    scriptCleanups.push(loadScript('/wp-includes/js/dist/vendor/react-dom.mine1ab.js?ver=18.3.1.1', 'react-dom-js'));
    scriptCleanups.push(loadScript('/wp-includes/js/dist/escape-html.min3a9d.js?ver=6561a406d2d232a6fbd2', 'wp-escape-html-js'));
    scriptCleanups.push(loadScript('/wp-includes/js/dist/element.minfa0f.js?ver=a4eeeadd23c0d7ab1d2d', 'wp-element-js'));
    scriptCleanups.push(loadScript('/wp-content/plugins/metform/public/assets/js/appb526.js?ver=3.9.8', 'metform-app-js'));
    scriptCleanups.push(loadScript('/wp-content/plugins/metform/public/assets/lib/cute-alert/cute-alertb526.js?ver=3.9.8', 'cute-alert-js'));
    scriptCleanups.push(loadScript('/wp-content/themes/hello-elementor/assets/js/hello-frontend.min9b70.js?ver=3.3.0', 'hello-theme-frontend-js'));
    scriptCleanups.push(loadScript('/wp-content/plugins/elementskit-lite/libs/framework/assets/js/frontend-script3b71.js?ver=3.5.0', 'elementskit-framework-js-frontend-js'));
    scriptCleanups.push(loadScript('/wp-content/plugins/elementskit-lite/widgets/init/assets/js/widget-scripts3b71.js?ver=3.5.0', 'ekit-widget-scripts-js'));
    scriptCleanups.push(loadScript('/wp-content/plugins/elementor/assets/js/webpack.runtime.min89ce.js?ver=3.28.4', 'elementor-webpack-runtime-js'));
    scriptCleanups.push(loadScript('/wp-content/plugins/elementor/assets/js/frontend-modules.min89ce.js?ver=3.28.4', 'elementor-frontend-modules-js'));
    scriptCleanups.push(loadScript('/wp-includes/js/jquery/ui/core.minb37e.js?ver=1.13.3', 'jquery-ui-core-js'));
    
    // Create inline script for elementorFrontendConfig
    const elementorFrontendConfigScript = createInlineScript(
      'var elementorFrontendConfig = { "environmentMode": { "edit": false, "wpPreview": false, "isScriptDebug": false }, "i18n": { "shareOnFacebook": "Share on Facebook", "shareOnTwitter": "Share on Twitter", "pinIt": "Pin it", "download": "Download", "downloadImage": "Download image", "fullscreen": "Fullscreen", "zoom": "Zoom", "share": "Share", "playVideo": "Play Video", "previous": "Previous", "next": "Next", "close": "Close", "a11yCarouselPrevSlideMessage": "Previous slide", "a11yCarouselNextSlideMessage": "Next slide", "a11yCarouselFirstSlideMessage": "This is the first slide", "a11yCarouselLastSlideMessage": "This is the last slide", "a11yCarouselPaginationBulletMessage": "Go to slide" }, "is_rtl": false, "breakpoints": { "xs": 0, "sm": 480, "md": 768, "lg": 1025, "xl": 1440, "xxl": 1600 }, "responsive": { "breakpoints": { "mobile": { "label": "Mobile Portrait", "value": 767, "default_value": 767, "direction": "max", "is_enabled": true }, "mobile_extra": { "label": "Mobile Landscape", "value": 880, "default_value": 880, "direction": "max", "is_enabled": false }, "tablet": { "label": "Tablet Portrait", "value": 1024, "default_value": 1024, "direction": "max", "is_enabled": true }, "tablet_extra": { "label": "Tablet Landscape", "value": 1200, "default_value": 1200, "direction": "max", "is_enabled": false }, "laptop": { "label": "Laptop", "value": 1366, "default_value": 1366, "direction": "max", "is_enabled": false }, "widescreen": { "label": "Widescreen", "value": 2400, "default_value": 2400, "direction": "min", "is_enabled": false } }, "hasCustomBreakpoints": false }, "version": "3.28.4", "is_static": false, "experimentalFeatures": { "e_font_icon_svg": true, "additional_custom_breakpoints": true, "container": true, "e_local_google_fonts": true, "hello-theme-header-footer": true, "nested-elements": true, "editor_v2": true, "e_element_cache": true, "home_screen": true }, "urls": { "assets": "\\/wp-content\\/plugins\\/elementor\\/assets\\/" }, "swiperClass": "swiper", "settings": { "page": [], "editorPreferences": [] }, "kit": { "body_background_background": "classic", "active_breakpoints": ["viewport_mobile", "viewport_tablet"], "global_image_lightbox": "yes", "lightbox_enable_counter": "yes", "lightbox_enable_fullscreen": "yes", "lightbox_enable_zoom": "yes", "lightbox_enable_share": "yes", "lightbox_title_src": "title", "lightbox_description_src": "description", "hello_header_logo_type": "logo", "hello_header_menu_layout": "horizontal", "hello_footer_logo_type": "logo" }, "post": { "id": 5, "title": "Home%20%E2%80%93%20Medzoon%20%E2%80%93%20Medical%20%26%20Health%20Education%20Elementor%20Template%20Kit", "excerpt": "", "featuredImage": "\\/wp-content\\/uploads\\/sites\\/13\\/2024\\/09\\/home-165x1024.jpg" } };',
      'elementor-frontend-js-before'
    );
    
    scriptCleanups.push(loadScript('/wp-content/plugins/elementor/assets/js/frontend.min89ce.js?ver=3.28.4', 'elementor-frontend-js'));
    
    // Create inline script for jkit_ajax_url and jkit_nonce
    const jkitAjaxScript = createInlineScript(
      'var jkit_ajax_url = "https://demo.xperthemes.com/medzoon/?jkit-ajax-request=jkit_elements", jkit_nonce = "244d3e0422";',
      'elementor-frontend-js-after'
    );
    
    // Create inline script for jkit_element_pagination_option
    const jkitElementPaginationScript = createInlineScript(
      'var jkit_element_pagination_option = { "element_prefix": "jkit_element_ajax_" };',
      'jkit-element-pagination-js-extra'
    );
    
    scriptCleanups.push(loadScript('/wp-content/plugins/jeg-elementor-kit/assets/js/elements/post-paginationf4f2.js?ver=2.6.12', 'jkit-element-pagination-js'));
    scriptCleanups.push(loadScript('/wp-content/plugins/jeg-elementor-kit/assets/js/elements/sticky-elementf4f2.js?ver=2.6.12', 'jkit-sticky-element-js'));
    scriptCleanups.push(loadScript('/wp-content/plugins/header-footer-elementor/inc/js/frontenda1ec.js?ver=2.3.0', 'hfe-frontend-js-js'));
    scriptCleanups.push(loadScript('/wp-content/plugins/elementor/assets/lib/font-awesome/js/v4-shims.min89ce.js?ver=3.28.4', 'font-awesome-4-shim-js'));
    scriptCleanups.push(loadScript('/wp-content/plugins/elementskit-lite/widgets/init/assets/js/animate-circle.min3b71.js?ver=3.5.0', 'animate-circle-js'));
    
    // Create inline script for elementskit-elementor-js-extra
    const elementskitElementorJsExtra = createInlineScript(
      'var ekit_config = { "ajaxurl": "\\/wp-admin\\/admin-ajax.php", "nonce": "8a3e96041d" };',
      'elementskit-elementor-js-extra'
    );
    
    scriptCleanups.push(loadScript('/wp-content/plugins/elementskit-lite/widgets/init/assets/js/elementor3b71.js?ver=3.5.0', 'elementskit-elementor-js'));
    
    // Clean up when component unmounts
    return () => {
      if (azimJsCleanup) azimJsCleanup();
      if (azimCssCleanup) azimCssCleanup();
      
      // Clean up all style elements
      styleCleanups.forEach(cleanup => {
        if (cleanup) cleanup();
      });
      
      // Clean up all script elements
      scriptCleanups.forEach(cleanup => {
        if (cleanup) cleanup();
      });
      
      // Clean up inline scripts
      if (mejsL10nScript) mejsL10nScript();
      if (wpmejsSettingsScript) wpmejsSettingsScript();
      if (elementorFrontendConfigScript) elementorFrontendConfigScript();
      if (jkitAjaxScript) jkitAjaxScript();
      if (jkitElementPaginationScript) jkitElementPaginationScript();
      if (elementskitElementorJsExtra) elementskitElementorJsExtra();
    };
  }, []); // Empty dependency array means this runs once on mount

  // Component doesn't render anything visible
  return null;
};

export default ScriptLoader;
