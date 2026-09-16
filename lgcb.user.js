// ==UserScript==
// @name Luogu Chat Better!
// @namespace http://tampermonkey.net/
// @version 5.3.1
// @author Forever_Rain
// @license MIT
// @description 洛谷私信优化
// @icon https://cdn.luogu.com.cn/upload/usericon/3.png
// @match https://www.luogu.com.cn/chat
// @match https://www.luogu.com.cn/chat/*
// @match https://www.luogu.com.cn/chat?uid=*
// @grant none
// ==/UserScript==

/******************** User Settings ********************/
const CONFIG = {
    // 自己消息
    enableOwnColor: true,
    ownBgColor: "#d9f0ff",
    ownTextColor: "#000000",
    enableOwnRadius: true,

    // 对方消息
    enableOtherColor: false,
    otherBgColor: "",
    otherTextColor: "",
    enableOtherRadius: true,

    // 引用回复
    enableQuoteReply: true,
    quoteSeparator: " ||"
};
/********************************************************/

(function() {
    'use strict';

    function getInputElement() {
        let input = document.querySelector('textarea.lfe-form-sz-middle');
        if (input && input.offsetParent !== null) {
            return input;
        }
        const fallbackSelectors = [
            'textarea[name="content"]',
            '.chat-input textarea',
            '.message-editor textarea',
            '.input-wrap textarea',
            '#chat-input textarea'
        ];
        for (const sel of fallbackSelectors) {
            const el = document.querySelector(sel);
            if (el && el.offsetParent !== null) {
                return el;
            }
        }
        return null;
    }

    function isSearchInput(el) {
        if (!el) return false;
        if (el.placeholder && el.placeholder.includes('搜索联系人')) return true;
        if (el.closest && el.closest('.side')) return true;
        return false;
    }

    function focusInput(retries = 5) {
        if (isSearchInput(document.activeElement)) return;
        const input = getInputElement();
        if (input) {
            if (document.activeElement !== input) {
                input.focus();
                if (input.isContentEditable) {
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(input);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if (retries > 0) {
            setTimeout(() => focusInput(retries - 1), 200);
        }
    }

    function isSendButton(el) {
        if (!el) return false;
        const tag = el.tagName.toLowerCase();
        if (tag === 'button' || (tag === 'input' && (el.type === 'submit' || el.type === 'button'))) {
            const text = el.innerText || el.value || '';
            if (text.includes('发送') || text.includes('Send')) return true;
            if (el.classList && (el.classList.contains('send-btn') || el.classList.contains('chat-send-btn'))) return true;
            if (el.getAttribute('aria-label') === '发送') return true;
        }
        if (el.querySelector && el.querySelector('svg[data-icon="paper-plane"], svg[data-icon="send"]')) return true;
        return false;
    }

    function onDocumentClick(e) {
        let target = e.target;
        while (target && target !== document.body) {
            if (isSendButton(target)) {
                setTimeout(focusInput, 150);
                break;
            }
            target = target.parentElement;
        }
    }

    function onKeyDown(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            const active = document.activeElement;
            if (active && (active.tagName === 'TEXTAREA' || active.isContentEditable)) {
                setTimeout(focusInput, 150);
            }
        }
    }

    document.addEventListener('click', onDocumentClick, true);
    document.addEventListener('keydown', onKeyDown);

    const observer = new MutationObserver((mutations) => {
        if (isSearchInput(document.activeElement)) return;
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                const input = getInputElement();
                if (input && document.activeElement !== input && document.hasFocus()) {
                    const active = document.activeElement;
                    if (active && (active.tagName === 'TEXTAREA' || active.isContentEditable)) {
                        if (active === input) return;
                    }
                    setTimeout(focusInput, 100);
                }
                break;
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', () => {
        setTimeout(focusInput, 500);
    });
    if (document.readyState === 'complete') {
        setTimeout(focusInput, 300);
    }
})();

(function() {
    'use strict';
    const searchClasses = ['message'];
    function replacePics(element) {
        if (!element) return;
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, {
            acceptNode: function(node) {
                if (node.classList && searchClasses.some(className => node.classList == className)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
            }
        }, false);
        let node;
        while (node = walker.nextNode()) {
            let a = node.innerHTML.indexOf("![");
            while(a != -1){
                let b = node.innerHTML.indexOf("](", a);
                if(b == -1) break;
                let c = node.innerHTML.indexOf(")", b);
                if(c == -1) break;
                let link = node.innerHTML.substr(b + 2, c - b - 2);
                let text = node.innerHTML.substr(a + 2, b - a - 2);
                if(text == '') text = link;
                let regex = node.innerHTML.substr(a, c - a + 1);
                node.innerHTML = node.innerHTML.replace(regex, `<img style="max-width: 516px;" src="${link}" alt="${text}">`);
                a = node.innerHTML.indexOf("![");
            }
        }
    }
    replacePics(document.body);
    const observerPics = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        replacePics(node);
                    }
                });
            }
        });
    });
    observerPics.observe(document.body, { childList: true, subtree: true });
})();

// 自定义消息
(function() {
    'use strict';
    const config = CONFIG;
    const isValidColor = (c) => /^#[0-9A-Fa-f]{6}$/.test(c);
    let css = '';

    if (config.enableOwnRadius || config.enableOwnColor) {
        const ownBg = (config.enableOwnColor && isValidColor(config.ownBgColor)) ? config.ownBgColor : '';
        const ownText = (config.enableOwnColor && isValidColor(config.ownTextColor)) ? config.ownTextColor : '';
        const ownRadius = config.enableOwnRadius ? 'border-radius: 12px !important;' : '';
        if (ownBg || ownText || ownRadius) {
            css += `.message-block.right .message {`;
            if (ownBg) css += ` background-color: ${ownBg} !important;`;
            if (ownText) css += ` color: ${ownText} !important;`;
            if (ownRadius) css += ` border-radius: 12px !important;`;
            css += ` padding: 6px 12px !important;`;
            css += ` }\n`;
        }
    }

    if (config.enableOtherRadius || config.enableOtherColor) {
        const otherBg = (config.enableOtherColor && isValidColor(config.otherBgColor)) ? config.otherBgColor : '';
        const otherText = (config.enableOtherColor && isValidColor(config.otherTextColor)) ? config.otherTextColor : '';
        const otherRadius = config.enableOtherRadius ? 'border-radius: 12px !important;' : '';
        if (otherBg || otherText || otherRadius) {
            css += `.message-block.left .message {`;
            if (otherBg) css += ` background-color: ${otherBg} !important;`;
            if (otherText) css += ` color: ${otherText} !important;`;
            if (otherRadius) css += ` border-radius: 12px !important;`;
            css += ` padding: 6px 12px !important;`;
            css += ` }\n`;
        }
    }
    css += `
        #quote-menu {
            display: none;
            position: fixed;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            padding: 6px 0;
            min-width: 130px;
            z-index: 10000;
            font-size: 14px;
            color: #333;
            border: 1px solid #e8e8e8;
            user-select: none;
        }
        #quote-menu .menu-item {
            padding: 10px 24px;
            cursor: pointer;
            transition: background 0.15s;
            white-space: nowrap;
        }
        #quote-menu .menu-item:hover {
            background: #f0f4ff;
        }
    `;

    if (css.trim()) {
        const styleId = 'luogu-message-style-custom';
        let style = document.getElementById(styleId);
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }
        style.textContent = css;
    }
})();

(function() {
    'use strict';
    const config = CONFIG;
    if (!config.enableQuoteReply) return;
    function generateMarkdown(node) {
        let result = '';
        const stack = [node];
        while (stack.length) {
            const n = stack.shift();
            if (n.nodeType === Node.TEXT_NODE) {
                result += n.textContent;
            } else if (n.nodeType === Node.ELEMENT_NODE) {
                const tag = n.tagName.toLowerCase();
                if (n.classList && n.classList.contains('katex')) {
                    const ann = n.querySelector('annotation[encoding="application/x-tex"]');
                    const raw = ann ? ann.textContent.trim() : '';
                    result += raw ? '$' + raw + '$' : n.textContent;
                } else if (tag === 'script' && n.type && /^math\/tex/.test(n.type)) {
                    const raw = n.textContent.trim();
                    result += (n.type.includes('block') || n.type.includes('display'))
                        ? '$$\n' + raw + '\n$$'
                        : '$' + raw + '$';
                } else if (tag === 'img') {
                    const alt = n.getAttribute('alt') || '';
                    const src = n.getAttribute('src') || '';
                    if (src) result += '![' + alt + '](' + src + ')';
                } else if (tag === 'a') {
                    const text = n.textContent;
                    const href = n.getAttribute('href') || '';
                    const isMention = text.trim().startsWith('@') || /\/user\//.test(href);
                    const isBareURL = /^(https?:\/\/|www\.)/i.test(text.trim()) && !/\s/.test(text.trim());
                    if (isMention || isBareURL) {
                        result += text;
                    } else {
                        let inner = '';
                        for (let i = 0; i < n.childNodes.length; i++) {
                            inner += generateMarkdown(n.childNodes[i]);
                        }
                        if (inner === '') inner = text;
                        result += '[' + inner + '](' + href + ')';
                    }
                } else if (tag === 'strong' || tag === 'b') {
                    result += '**' + n.textContent + '**';
                } else if (tag === 'em' || tag === 'i') {
                    result += '*' + n.textContent + '*';
                } else if (tag === 'del' || tag === 's') {
                    result += '~~' + n.textContent + '~~';
                } else if (tag === 'code') {
                    result += '`' + n.textContent + '`';
                } else {
                    for (let i = n.childNodes.length - 1; i >= 0; i--) {
                        stack.unshift(n.childNodes[i]);
                    }
                }
            }
        }
        return result.trim();
    }

    const menu = document.createElement('div');
    menu.id = 'quote-menu';

    const actions = [
        { id: 'quote', label: '引用' },
        { id: 'copy', label: '复制' }
    ];
    actions.forEach(action => {
        const item = document.createElement('div');
        item.className = 'menu-item';
        item.dataset.action = action.id;
        item.textContent = action.label;
        menu.appendChild(item);
    });
    document.body.appendChild(menu);

    let currentMessageBlock = null;

    menu.addEventListener('click', function(e) {
        const item = e.target.closest('.menu-item');
        if (!item) return;
        const action = item.dataset.action;
        if (!action || !currentMessageBlock) return;

        const msgEl = currentMessageBlock.querySelector('.message');
        if (!msgEl) return;

        switch (action) {
            case 'quote': {
                const md = generateMarkdown(msgEl);
                if (!md) break;
                const textarea = document.querySelector('textarea.lfe-form-sz-middle');
                if (!textarea) break;
                const separator = config.quoteSeparator || '||';
                const content = separator + ' ' + md;
                textarea.value = content;
                textarea.focus();
                textarea.setSelectionRange(0, 0);
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                break;
            }
            case 'copy': {
                const textContent = msgEl.textContent;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(textContent).catch(() => {
                        fallbackCopy(textContent);
                    });
                } else {
                    fallbackCopy(textContent);
                }
                function fallbackCopy(text) {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    ta.remove();
                }
                break;
            }
        }

        menu.style.display = 'none';
        currentMessageBlock = null;
    });

    document.addEventListener('click', function(e) {
        if (menu.style.display === 'none') return;
        if (!menu.contains(e.target)) {
            menu.style.display = 'none';
            currentMessageBlock = null;
        }
    });

    document.addEventListener('click', function(e) {
        if (menu.contains(e.target)) return;
        const block = e.target.closest('.message-block');
        if (!block) return;
        const msg = e.target.closest('.message');
        if (!msg) return;
        if (e.target.closest('a') || e.target.closest('img')) return;

        e.preventDefault();
        currentMessageBlock = block;

        menu.style.display = 'block';
        const x = Math.min(e.clientX, window.innerWidth - 160);
        const y = Math.min(e.clientY, window.innerHeight - 60);
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
    });
})();
