import { Color } from '../core/domain/Color.js';
const CRC32 = require('crc-32');

export class URLService {
  constructor() {
    this.currentColors = [];
    window.addEventListener('popstate', this.parseURL.bind(this));
    this.parseURL();
  }

  parseURL() {
    const params = new URLSearchParams(window.location.search);
    const colorParam = params.get('colors');
    
    try {
      this.currentColors = colorParam 
        ? colorParam.split('-').map(c => new Color(c))
        : [];
      window.dispatchEvent(new CustomEvent('colors-updated', {
        detail: this.currentColors
      }));
    } catch (error) {
      console.error('Invalid color parameters:', error);
    }
  }

  updateURL(colors, useLegacy = false) {
    let params;
    
    if (useLegacy) {
      const encoded = this._encodeLegacy(colors);
      params = `v=1&c=${encoded}`;
    } else {
      const colorString = colors.map(c => c.toString().replace('#', '')).join('-');
      params = `colors=${colorString}`;
    }
    
    const newURL = `${window.location.pathname}?${params}`;
    window.history.pushState({}, '', newURL);
    this.parseURL();
  }

  _encodeLegacy(colors) {
    const hexString = colors.map(c => c.toString().replace('#', '')).join('');
    const crc = this._calculateCRC32(hexString);
    return btoa(`${hexString}|${crc}`).replace(/=/g, '');
  }

  _parseLegacyURL(encoded) {
    const decoded = atob(encoded);
    const [data, checksum] = decoded.split('|');
    
    if (this._calculateCRC32(data) !== checksum) {
      throw new Error('Invalid legacy URL checksum');
    }
    
    return data.match(/.{6}/g).map(c => `#${c}`);
  }

  _calculateCRC32(str) {
    const CRC32 = require('crc-32');
    return (CRC32.str(str) >>> 0).toString(16).padStart(8, '0');
  }
}