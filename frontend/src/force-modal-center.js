/**
 * MODAL CENTERING FIX - PROPER CENTERING
 * This script forces all modals to be properly centered regardless of Bootstrap's inline styles
 * Works for: lot-manager modals, item-form modals, and any other Bootstrap modals
 */

(function() {
  'use strict';

  // Helper function to set style with !important
  function setImportantStyle(element, property, value) {
    if (element && element.style) {
      element.style.setProperty(property, value, 'important');
    }
  }

  // Function to get all visible modals
  function getVisibleModals() {
    return document.querySelectorAll('.modal.fade.show, .modal.show.d-block, .modal.d-block');
  }

  // Function to force modal positioning
  function forceModalCentering() {
    var modalWrappers = getVisibleModals();
    
    for (var i = 0; i < modalWrappers.length; i++) {
      var modalEl = modalWrappers[i];
      if (!modalEl) continue;
      
      // Force wrapper to be fixed and centered with flexbox
      setImportantStyle(modalEl, 'position', 'fixed');
      setImportantStyle(modalEl, 'display', 'flex');
      setImportantStyle(modalEl, 'align-items', 'center');
      setImportantStyle(modalEl, 'justify-content', 'center');
      setImportantStyle(modalEl, 'top', '0');
      setImportantStyle(modalEl, 'left', '0');
      setImportantStyle(modalEl, 'right', '0');
      setImportantStyle(modalEl, 'bottom', '0');
      setImportantStyle(modalEl, 'width', '100vw');
      setImportantStyle(modalEl, 'height', '100vh');
      setImportantStyle(modalEl, 'max-width', '100vw');
      setImportantStyle(modalEl, 'max-height', '100vh');
      setImportantStyle(modalEl, 'z-index', '9999');
      setImportantStyle(modalEl, 'margin', '0');
      setImportantStyle(modalEl, 'padding', '20px');
      setImportantStyle(modalEl, 'box-sizing', 'border-box');
      setImportantStyle(modalEl, 'overflow', 'auto');
    }

    // Force modal dialog to be centered (remove Bootstrap's transform)
    var modalDialogs = document.querySelectorAll('.modal.fade.show .modal-dialog, .modal.show.d-block .modal-dialog, .modal.d-block .modal-dialog');
    for (var j = 0; j < modalDialogs.length; j++) {
      var dialog = modalDialogs[j];
      if (!dialog) continue;
      
      setImportantStyle(dialog, 'position', 'relative');
      setImportantStyle(dialog, 'display', 'flex');
      setImportantStyle(dialog, 'flex-direction', 'column');
      setImportantStyle(dialog, 'top', 'auto');
      setImportantStyle(dialog, 'left', 'auto');
      setImportantStyle(dialog, 'right', 'auto');
      setImportantStyle(dialog, 'bottom', 'auto');
      setImportantStyle(dialog, 'transform', 'none');
      setImportantStyle(dialog, 'margin', '0 auto');
      setImportantStyle(dialog, 'margin-left', 'auto');
      setImportantStyle(dialog, 'margin-right', 'auto');
      setImportantStyle(dialog, 'max-width', '1200px');
      setImportantStyle(dialog, 'width', '100%');
      setImportantStyle(dialog, 'pointer-events', 'auto');
    }

    // Force modal content
    var modalContents = document.querySelectorAll('.modal.fade.show .modal-content, .modal.show.d-block .modal-content, .modal.d-block .modal-content');
    for (var k = 0; k < modalContents.length; k++) {
      var content = modalContents[k];
      if (!content) continue;
      
      setImportantStyle(content, 'position', 'relative');
      setImportantStyle(content, 'display', 'flex');
      setImportantStyle(content, 'flex-direction', 'column');
      setImportantStyle(content, 'top', 'auto');
      setImportantStyle(content, 'left', 'auto');
      setImportantStyle(content, 'right', 'auto');
      setImportantStyle(content, 'bottom', 'auto');
      setImportantStyle(content, 'transform', 'none');
      setImportantStyle(content, 'margin', '0 auto');
      setImportantStyle(content, 'margin-top', '0');
      setImportantStyle(content, 'max-width', '100%');
      setImportantStyle(content, 'width', '100%');
      setImportantStyle(content, 'pointer-events', 'auto');
    }

    // Force modal backdrops
    var backdrops = document.querySelectorAll('.modal-backdrop.fade.show, .modal-backdrop.show');
    for (var m = 0; m < backdrops.length; m++) {
      var backdrop = backdrops[m];
      if (!backdrop) continue;
      
      setImportantStyle(backdrop, 'position', 'fixed');
      setImportantStyle(backdrop, 'top', '0');
      setImportantStyle(backdrop, 'left', '0');
      setImportantStyle(backdrop, 'right', '0');
      setImportantStyle(backdrop, 'bottom', '0');
      setImportantStyle(backdrop, 'width', '100vw');
      setImportantStyle(backdrop, 'height', '100vh');
      setImportantStyle(backdrop, 'z-index', '9998');
    }

    // Force form overlays (item-form component)
    var formOverlays = document.querySelectorAll('.form-overlay');
    for (var n = 0; n < formOverlays.length; n++) {
      var overlay = formOverlays[n];
      if (!overlay) continue;
      
      setImportantStyle(overlay, 'position', 'fixed');
      setImportantStyle(overlay, 'display', 'flex');
      setImportantStyle(overlay, 'align-items', 'center');
      setImportantStyle(overlay, 'justify-content', 'center');
      setImportantStyle(overlay, 'top', '0');
      setImportantStyle(overlay, 'left', '0');
      setImportantStyle(overlay, 'right', '0');
      setImportantStyle(overlay, 'bottom', '0');
      setImportantStyle(overlay, 'width', '100vw');
      setImportantStyle(overlay, 'height', '100vh');
      setImportantStyle(overlay, 'z-index', '9999');
      setImportantStyle(overlay, 'margin', '0');
      setImportantStyle(overlay, 'padding', '20px');
    }

  // Force form containers (item-form component)
    var formContainers = document.querySelectorAll('.form-container');
    for (var p = 0; p < formContainers.length; p++) {
      var container = formContainers[p];
      if (!container) continue;
      
      setImportantStyle(container, 'position', 'relative');
      setImportantStyle(container, 'display', 'flex');
      setImportantStyle(container, 'flex-direction', 'column');
      setImportantStyle(container, 'top', 'auto');
      setImportantStyle(container, 'left', 'auto');
      setImportantStyle(container, 'right', 'auto');
      setImportantStyle(container, 'bottom', 'auto');
      setImportantStyle(container, 'transform', 'none');
      setImportantStyle(container, 'margin', '0 auto');
      setImportantStyle(container, 'margin-left', 'auto');
      setImportantStyle(container, 'margin-right', 'auto');
      setImportantStyle(container, 'width', '100%');
      setImportantStyle(container, 'max-width', '750px');
      setImportantStyle(container, 'pointer-events', 'auto');
    }

    // SPECIAL FIX: Target lot-manager modals specifically
    var lotManagerModals = document.querySelectorAll('lot-manager .modal, .lot-manager .modal');
    for (var lm = 0; lm < lotManagerModals.length; lm++) {
      var lmModal = lotManagerModals[lm];
      if (!lmModal) continue;
      
      // Find parent lot-manager element
      var parentLotManager = findParentWithClass(lmModal, 'lot-manager');
      
      setImportantStyle(lmModal, 'position', 'fixed');
      setImportantStyle(lmModal, 'display', 'flex');
      setImportantStyle(lmModal, 'align-items', 'center');
      setImportantStyle(lmModal, 'justify-content', 'center');
      setImportantStyle(lmModal, 'top', '0');
      setImportantStyle(lmModal, 'left', '0');
      setImportantStyle(lmModal, 'right', '0');
      setImportantStyle(lmModal, 'bottom', '0');
      setImportantStyle(lmModal, 'width', '100vw');
      setImportantStyle(lmModal, 'height', '100vh');
      setImportantStyle(lmModal, 'z-index', '9999');
      setImportantStyle(lmModal, 'margin', '0');
      setImportantStyle(lmModal, 'padding', '20px');
      setImportantStyle(lmModal, 'background', 'rgba(0, 0, 0, 0.6)');
    }

    // Force lot-manager modal dialogs - with modal-xl class
    var lotManagerDialogs = document.querySelectorAll('lot-manager .modal-dialog, .lot-manager .modal-dialog, .modal-dialog.modal-xl');
    for (var lmd = 0; lmd < lotManagerDialogs.length; lmd++) {
      var lmDialog = lotManagerDialogs[lmd];
      if (!lmDialog) continue;
      
      setImportantStyle(lmDialog, 'position', 'relative');
      setImportantStyle(lmDialog, 'display', 'flex');
      setImportantStyle(lmDialog, 'flex-direction', 'column');
      setImportantStyle(lmDialog, 'top', 'auto');
      setImportantStyle(lmDialog, 'left', 'auto');
      setImportantStyle(lmDialog, 'right', 'auto');
      setImportantStyle(lmDialog, 'bottom', 'auto');
      setImportantStyle(lmDialog, 'transform', 'none');
      setImportantStyle(lmDialog, 'margin', '0 auto');
      setImportantStyle(lmDialog, 'margin-left', 'auto');
      setImportantStyle(lmDialog, 'margin-right', 'auto');
      setImportantStyle(lmDialog, 'max-width', '1400px');
      setImportantStyle(lmDialog, 'width', '95%');
    }

    // Force lot-manager modal contents
    var lotManagerContents = document.querySelectorAll('lot-manager .modal-content, .lot-manager .modal-content');
    for (var lmc = 0; lmc < lotManagerContents.length; lmc++) {
      var lmContent = lotManagerContents[lmc];
      if (!lmContent) continue;
      
      setImportantStyle(lmContent, 'position', 'relative');
      setImportantStyle(lmContent, 'top', 'auto');
      setImportantStyle(lmContent, 'left', 'auto');
      setImportantStyle(lmContent, 'transform', 'none');
      setImportantStyle(lmContent, 'margin', '0 auto');
      setImportantStyle(lmContent, 'box-shadow', '0 25px 80px rgba(0, 0, 0, 0.35)');
      setImportantStyle(lmContent, 'border-radius', '12px');
    }

    // Force lot-manager backdrops
    var lotManagerBackdrops = document.querySelectorAll('lot-manager ~ .modal-backdrop, .lot-manager ~ .modal-backdrop, lot-manager + .modal-backdrop');
    for (var lmb = 0; lmb < lotManagerBackdrops.length; lmb++) {
      var lmBackdrop = lotManagerBackdrops[lmb];
      if (!lmBackdrop) continue;
      
      setImportantStyle(lmBackdrop, 'position', 'fixed');
      setImportantStyle(lmBackdrop, 'top', '0');
      setImportantStyle(lmBackdrop, 'left', '0');
      setImportantStyle(lmBackdrop, 'right', '0');
      setImportantStyle(lmBackdrop, 'bottom', '0');
      setImportantStyle(lmBackdrop, 'width', '100vw');
      setImportantStyle(lmBackdrop, 'height', '100vh');
      setImportantStyle(lmBackdrop, 'z-index', '9998');
    }

    // SPECIAL FIX: Target dashboard-container modals (item-list)
    var dashboardModals = document.querySelectorAll('.dashboard-container .modal, .dashboard-container .modal.fade.show');
    for (var dm = 0; dm < dashboardModals.length; dm++) {
      var dbModal = dashboardModals[dm];
      if (!dbModal) continue;
      
      setImportantStyle(dbModal, 'position', 'fixed');
      setImportantStyle(dbModal, 'display', 'flex');
      setImportantStyle(dbModal, 'align-items', 'center');
      setImportantStyle(dbModal, 'justify-content', 'center');
      setImportantStyle(dbModal, 'top', '0');
      setImportantStyle(dbModal, 'left', '0');
      setImportantStyle(dbModal, 'right', '0');
      setImportantStyle(dbModal, 'bottom', '0');
      setImportantStyle(dbModal, 'width', '100vw');
      setImportantStyle(dbModal, 'height', '100vh');
      setImportantStyle(dbModal, 'z-index', '9999');
      setImportantStyle(dbModal, 'margin', '0');
      setImportantStyle(dbModal, 'padding', '20px');
      setImportantStyle(dbModal, 'background', 'rgba(0, 0, 0, 0.6)');
    }

    // Force dashboard-container modal dialogs
    var dashboardDialogs = document.querySelectorAll('.dashboard-container .modal-dialog');
    for (var dd = 0; dd < dashboardDialogs.length; dd++) {
      var dbDialog = dashboardDialogs[dd];
      if (!dbDialog) continue;
      
      setImportantStyle(dbDialog, 'position', 'relative');
      setImportantStyle(dbDialog, 'display', 'flex');
      setImportantStyle(dbDialog, 'flex-direction', 'column');
      setImportantStyle(dbDialog, 'top', 'auto');
      setImportantStyle(dbDialog, 'left', 'auto');
      setImportantStyle(dbDialog, 'right', 'auto');
      setImportantStyle(dbDialog, 'bottom', 'auto');
      setImportantStyle(dbDialog, 'transform', 'none');
      setImportantStyle(dbDialog, 'margin', '0 auto');
      setImportantStyle(dbDialog, 'max-width', '700px');
      setImportantStyle(dbDialog, 'width', '100%');
    }

    // Force dashboard-container modal contents
    var dashboardContents = document.querySelectorAll('.dashboard-container .modal-content');
    for (var dc = 0; dc < dashboardContents.length; dc++) {
      var dbContent = dashboardContents[dc];
      if (!dbContent) continue;
      
      setImportantStyle(dbContent, 'position', 'relative');
      setImportantStyle(dbContent, 'top', 'auto');
      setImportantStyle(dbContent, 'left', 'auto');
      setImportantStyle(dbContent, 'transform', 'none');
      setImportantStyle(dbContent, 'margin', '0 auto');
      setImportantStyle(dbContent, 'box-shadow', '0 25px 80px rgba(0, 0, 0, 0.35)');
      setImportantStyle(dbContent, 'border-radius', '12px');
    }
  }

  // Helper function to find parent element with specific class
  function findParentWithClass(element, className) {
    var current = element.parentElement;
    while (current && current !== document.body) {
      if (current.classList && current.classList.contains(className)) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  // Run immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceModalCentering);
  } else {
    forceModalCentering();
  }

  // Run multiple times after Angular renders
  setTimeout(forceModalCentering, 0);
  setTimeout(forceModalCentering, 10);
  setTimeout(forceModalCentering, 50);
  setTimeout(forceModalCentering, 100);
  setTimeout(forceModalCentering, 200);
  setTimeout(forceModalCentering, 500);
  
  // Continue running periodically to catch Angular dynamic rendering
  var intervalId = setInterval(forceModalCentering, 800);
  
  // Also run on various events
  window.addEventListener('resize', forceModalCentering);
  window.addEventListener('scroll', forceModalCentering);
  
  // Use MutationObserver to detect when modals are added
  var observer = new MutationObserver(function(mutations) {
    var shouldRun = false;
    for (var r = 0; r < mutations.length; r++) {
      var mutation = mutations[r];
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (var s = 0; s < mutation.addedNodes.length; s++) {
          var node = mutation.addedNodes[s];
          if (node.nodeType === 1) {
            var el = node;
            var className = el.className || '';
            var id = el.id || '';
            
            if (typeof className !== 'string') className = '';
            
            if (el.classList && (
              el.classList.contains('modal') ||
              el.classList.contains('modal-dialog') ||
              el.classList.contains('modal-content') ||
              el.classList.contains('modal-backdrop') ||
              el.classList.contains('form-overlay') ||
              el.classList.contains('form-container') ||
              el.classList.contains('modal-wrapper') ||
              el.classList.contains('modal-container') ||
              className.indexOf('modal') !== -1 ||
              className.indexOf('dialog') !== -1 ||
              id.indexOf('modal') !== -1 ||
              id.indexOf('dialog') !== -1 ||
              el.querySelector('.modal, .form-overlay, .modal-dialog, .modal-content')
            )) {
              shouldRun = true;
              break;
            }
          }
        }
      }
    }
    
    if (shouldRun) {
      setTimeout(forceModalCentering, 10);
      setTimeout(forceModalCentering, 50);
      setTimeout(forceModalCentering, 100);
      setTimeout(forceModalCentering, 200);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Stop observing after 60 seconds to prevent memory leaks
  setTimeout(function() {
    observer.disconnect();
    clearInterval(intervalId);
  }, 60000);
  
  console.log('[Modal Fix] Proper modal centering fix activated');
})();

