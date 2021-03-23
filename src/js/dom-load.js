import Hunt from 'huntjs';

import { __removeClass, __addClass } from './lib/utils-js/utils';

const domLoad = () => {

  console.log('domLoad');

  const d = document;
  const $body = d.body;

  const $stickyAnchor = document.querySelector('.sticky-anchor');
  const $mainHeader = document.querySelector('.main-header');

  let observer = new Hunt($stickyAnchor, {
    persist: true,
    offset: 0,
    leave: () => {

      __addClass($mainHeader, 'sticky');


    },
    enter: () => {

      __removeClass($mainHeader, 'sticky');

    },
  });


  // main nav scroll to element
  const $scrollToLinks = document.querySelectorAll('[data-rel]');
  Array.from($scrollToLinks).forEach(($element) => {

    $element.addEventListener('click', (e) => {

      let yOffset = undefined;

      if ($element.dataset.offset) {
        yOffset = 0;
      } else {
        yOffset = -90;
      }

      const element = document.querySelector($element.getAttribute('data-rel'))
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({top: y, behavior: 'smooth'});

      e.preventDefault();

    });


  });


  const $footerLogo = document.querySelectorAll('.footer-info-to-load');
  observer = new Hunt($footerLogo, {
    enter: (image) => __addClass(image, 'loaded'),
  });

};

export default domLoad;
