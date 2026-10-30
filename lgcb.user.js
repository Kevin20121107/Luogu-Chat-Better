// ==UserScript==
// @name Luogu Chat Better!
// @namespace http://tampermonkey.net/
// @version 5.3
// @author Forever_Rain
// @description 洛谷私信优化
// @icon https://cdn.luogu.com.cn/upload/usericon/3.png
// @match https://www.luogu.com.cn/chat
// @match https://www.luogu.com.cn/chat/*
// @match https://www.luogu.com.cn/chat?uid=*
// @grant none
// ==/UserScript==
const CONFIG = {
    enableOwnColor: true,
    ownBgColor: "#d9f0ff",
    ownTextColor: "#000000",
    enableOwnRadius: true,
    enableOtherColor: false,
    otherBgColor: "",
    otherTextColor: "",
    enableOtherRadius: true,
    enableQuoteReply: true,
    quoteSeparator: " ||"
};
(function () {
    'use strict';
    const sels = [
        'textarea.lfe-form-sz-middle',
        'textarea[name="content"]',
        '.chat-input textarea',
        '.message-editor textarea',
        '.input-wrap textarea',
        '#chat-input textarea',
        '[data-testid="chat-input"]',
        '.chat-input [contenteditable="true"]',
        '.message-editor [contenteditable="true"]',
        '[contenteditable="true"][role="textbox"]'
    ];
    function visible(el) {
        if (!el || !el.isConnected)
            return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            el.getClientRects().length > 0;
    }
    function isSearch(el) {
        if (!el)
            return false;
        const isTextControl = el.tagName === 'INPUT' ||
            el.tagName === 'TEXTAREA' ||
            el.isContentEditable ||
            el.getAttribute('role') === 'textbox';
        if (!isTextControl)
            return false;
        const desc = [
            el.placeholder || '',
            el.getAttribute('aria-label') || '',
            el.name || ''
        ].join(' ');
        if (/搜索|联系人|search/i.test(desc)) {
            return true;
        }
        return !!el.closest('.side');
    }
    function editable(el) {
        if (!el)
            return false;
        if (el.isContentEditable)
            return true;
        if (el.tagName === 'TEXTAREA' ||
            el.tagName === 'SELECT') {
            return true;
        }
        if (el.tagName === 'INPUT') {
            return !/^(button|submit|reset|checkbox|radio|file|hidden|image)$/i.test(el.type);
        }
        return false;
    }
    function validEl(el) {
        if (!el || !visible(el))
            return false;
        if (el.disabled || el.readOnly)
            return false;
        if (el.closest('.side, #quote-menu, .custom-item-input, .input-overlay')) {
            return false;
        }
        if (isSearch(el))
            return false;
        if (el.tagName === 'INPUT' &&
            !/^(text|search)$/i.test(el.type)) {
            return false;
        }
        return el.tagName === 'TEXTAREA' ||
            el.isContentEditable ||
            el.getAttribute('role') === 'textbox' ||
            (el.tagName === 'INPUT' && /^(text|search)$/i.test(el.type));
    }
    function score(el) {
        let score = el.tagName === 'TEXTAREA' ? 5 : 0;
        let n = el;
        for (let i = 0; n && i < 4; i++, n = n.parentElement) {
            const s = [
                typeof n.className === 'string' ? n.className : '',
                n.getAttribute && n.getAttribute('placeholder') || '',
                n.getAttribute && n.getAttribute('aria-label') || ''
            ].join(' ');
            if (/chat|message|editor|composer|content/i.test(s)) {
                score += 10;
            }
            if (/消息|私信|发送|回复/.test(s)) {
                score += 20;
            }
        }
        return score;
    }
    function getInput() {
        for (const sel of sels) {
            const els = document.querySelectorAll(sel);
            for (const el of els) {
                if (validEl(el)) {
                    return el;
                }
            }
        }
        const list = Array.from(document.querySelectorAll('textarea, [contenteditable="true"], [role="textbox"], input[type="text"]')).filter(validEl);
        list.sort((a, b) => score(b) - score(a));
        return list[0] || null;
    }
    function focus(tries = 20, f = false) {
        const inp = getInput();
        if (inp) {
            const act = document.activeElement;
            if (act === inp)
                return true;
            if (isSearch(act))
                return false;
            if (!f && editable(act))
                return false;
            try {
                inp.focus({ preventScroll: true });
            }
            catch (e) {
                inp.focus();
            }
            if (inp.isContentEditable) {
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(inp);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            return document.activeElement === inp;
        }
        if (tries > 0) {
            setTimeout(() => {
                focus(tries - 1, f);
            }, 150);
        }
        return false;
    }
    let timer = null;
    function schedule(delay = 120, f = false) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            focus(20, f);
        }, delay);
    }
    function isSend(target) {
        if (!target || !target.closest)
            return false;
        const button = target.closest('button, input[type="submit"], input[type="button"]');
        if (!button)
            return false;
        const t = [
            button.innerText || '',
            button.value || '',
            button.getAttribute('aria-label') || ''
        ].join(' ');
        return /发送|send/i.test(t) ||
            button.classList.contains('send-btn') ||
            button.classList.contains('chat-send-btn');
    }
    document.addEventListener('click', function (e) {
        if (isSend(e.target)) {
            schedule(180, true);
        }
    }, true);
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey &&
            e.key === 'Enter' &&
            document.activeElement === getInput()) {
            schedule(150, true);
        }
    });
    let prev = null;
    const observer = new MutationObserver(() => {
        const inp = getInput();
        if (inp && inp !== prev) {
            prev = inp;
            schedule(120, false);
        }
        if (!inp) {
            prev = null;
        }
    });
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'hidden']
    });
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            schedule(250, false);
        }, { once: true });
    }
    else {
        schedule(250, false);
    }
    window.addEventListener('load', () => {
        schedule(250, false);
    }, { once: true });
    window.addEventListener('popstate', () => {
        prev = null;
        schedule(250, false);
    });
})();
(function () {
    'use strict';
    const classes = ['message'];
    function replace(el) {
        if (!el)
            return;
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT, {
            acceptNode: function (n) {
                if (n.classList && classes.some(className => n.classList == className)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
            }
        }, false);
        let n;
        while (n = walker.nextNode()) {
            let a = n.innerHTML.indexOf("![");
            while (a != -1) {
                let b = n.innerHTML.indexOf("](", a);
                if (b == -1)
                    break;
                let c = n.innerHTML.indexOf(")", b);
                if (c == -1)
                    break;
                let link = n.innerHTML.substr(b + 2, c - b - 2);
                let t = n.innerHTML.substr(a + 2, b - a - 2);
                if (t == '')
                    t = link;
                let regex = n.innerHTML.substr(a, c - a + 1);
                n.innerHTML = n.innerHTML.replace(regex, `<img style="max-width: 516px;" src="${link}" alt="${t}">`);
                a = n.innerHTML.indexOf("![");
            }
        }
    }
    replace(document.body);
    const obs = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(n => {
                    if (n.nodeType === Node.ELEMENT_NODE) {
                        replace(n);
                    }
                });
            }
        });
    });
    obs.observe(document.body, { childList: true, subtree: true });
})();
(function () {
    'use strict';
    const cfg = CONFIG;
    const validColor = (c) => /^#[0-9A-Fa-f]{6}$/.test(c);
    let css = '';
    if (cfg.enableOwnRadius || cfg.enableOwnColor) {
        const obg = (cfg.enableOwnColor && validColor(cfg.ownBgColor)) ? cfg.ownBgColor : '';
        const otx = (cfg.enableOwnColor && validColor(cfg.ownTextColor)) ? cfg.ownTextColor : '';
        const orad = cfg.enableOwnRadius ? 'border-radius: 12px !important;' : '';
        if (obg || otx || orad) {
            css += `.message-block.right .message {`;
            if (obg)
                css += ` background-color: ${obg} !important;`;
            if (otx)
                css += ` color: ${otx} !important;`;
            if (orad)
                css += ` border-radius: 12px !important;`;
            css += ` padding: 6px 12px !important;`;
            css += ` }\n`;
        }
    }
    if (cfg.enableOtherRadius || cfg.enableOtherColor) {
        const ibg = (cfg.enableOtherColor && validColor(cfg.otherBgColor)) ? cfg.otherBgColor : '';
        const itx = (cfg.enableOtherColor && validColor(cfg.otherTextColor)) ? cfg.otherTextColor : '';
        const irad = cfg.enableOtherRadius ? 'border-radius: 12px !important;' : '';
        if (ibg || itx || irad) {
            css += `.message-block.left .message {`;
            if (ibg)
                css += ` background-color: ${ibg} !important;`;
            if (itx)
                css += ` color: ${itx} !important;`;
            if (irad)
                css += ` border-radius: 12px !important;`;
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
(function () {
    'use strict';
    const cfg = CONFIG;
    if (!cfg.enableQuoteReply)
        return;
    function getInput() {
        function visible(el) {
            if (!el || !el.isConnected)
                return false;
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && el.getClientRects().length > 0;
        }
        function isValid(el) {
            if (!visible(el) || el.disabled || el.readOnly)
                return false;
            if (el.closest('#quote-menu, .side, .custom-item-input, .input-overlay'))
                return false;
            const desc = [el.placeholder || '', el.getAttribute('aria-label') || '', el.name || '', el.getAttribute('class') || ''].join(' ');
            if (/搜索|联系人|search/i.test(desc))
                return false;
            return el.tagName === 'TEXTAREA' || el.isContentEditable || el.getAttribute('role') === 'textbox';
        }
        function getScore(el) {
            let score = 0;
            if (el.matches('textarea.lfe-form-sz-middle'))
                score += 100;
            if (el.matches('textarea[name="content"]'))
                score += 80;
            let n = el;
            for (let i = 0; n && i < 5; i++, n = n.parentElement) {
                const s = [n.getAttribute('class') || '', n.getAttribute('placeholder') || '', n.getAttribute('aria-label') || ''].join(' ');
                if (/chat|message|editor|composer|reply/i.test(s))
                    score += 20;
                if (/消息|私信|发送|回复|输入/.test(s))
                    score += 30;
            }
            return score;
        }
        const list = Array.from(document.querySelectorAll('textarea, [contenteditable="true"], [role="textbox"]')).filter(isValid);
        if (list.length === 0)
            return null;
        list.sort((a, b) => getScore(b) - getScore(a));
        if (list.length > 1 && getScore(list[0]) === 0)
            return null;
        return list[0];
    }
    function setInput(el, v) {
        if (el.tagName === 'TEXTAREA') {
            const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
            setter.call(el, v);
        }
        else {
            el.textContent = v;
        }
        try {
            el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: v }));
        }
        catch (e) {
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.focus();
        if (typeof el.setSelectionRange === 'function') {
            try {
                el.setSelectionRange(0, 0);
            }
            catch (e) { }
        }
        else if (el.isContentEditable) {
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(el);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    function toMd(n) {
        let result = '';
        const stack = [n];
        while (stack.length) {
            const n = stack.shift();
            if (n.nodeType === Node.TEXT_NODE) {
                result += n.textContent;
            }
            else if (n.nodeType === Node.ELEMENT_NODE) {
                const tag = n.tagName.toLowerCase();
                if (n.classList && n.classList.contains('katex')) {
                    const ann = n.querySelector('annotation[encoding="application/x-tex"]');
                    const raw = ann ? ann.textContent.trim() : '';
                    result += raw ? '$' + raw + '$' : n.textContent;
                }
                else if (tag === 'script' && n.type && /^math\/tex/.test(n.type)) {
                    const raw = n.textContent.trim();
                    result += (n.type.includes('block') || n.type.includes('display')) ? '$$\n' + raw + '\n$$' : '$' + raw + '$';
                }
                else if (tag === 'img') {
                    const alt = n.getAttribute('alt') || '';
                    const src = n.getAttribute('src') || '';
                    if (src)
                        result += '![' + alt + '](' + src + ')';
                }
                else if (tag === 'a') {
                    const t = n.textContent;
                    const href = n.getAttribute('href') || '';
                    const isMention = t.trim().startsWith('@') || /\/user\//.test(href);
                    const isBareURL = /^(https?:\/\/|www\.)/i.test(t.trim()) && !/\s/.test(t.trim());
                    if (isMention || isBareURL) {
                        result += t;
                    }
                    else {
                        let inner = '';
                        for (let i = 0; i < n.childNodes.length; i++)
                            inner += toMd(n.childNodes[i]);
                        if (inner === '')
                            inner = t;
                        result += '[' + inner + '](' + href + ')';
                    }
                }
                else if (tag === 'strong' || tag === 'b') {
                    result += '**' + n.textContent + '**';
                }
                else if (tag === 'em' || tag === 'i') {
                    result += '*' + n.textContent + '*';
                }
                else if (tag === 'del' || tag === 's') {
                    result += '~~' + n.textContent + '~~';
                }
                else if (tag === 'code') {
                    result += '`' + n.textContent + '`';
                }
                else {
                    for (let i = n.childNodes.length - 1; i >= 0; i--)
                        stack.unshift(n.childNodes[i]);
                }
            }
        }
        return result.trim();
    }
    const menu = document.createElement('div');
    menu.id = 'quote-menu';
    const acts = [{ id: 'quote', label: '引用' }, { id: 'copy', label: '复制' }];
    acts.forEach(act => {
        const it = document.createElement('div');
        it.className = 'menu-item';
        it.dataset.action = act.id;
        it.textContent = act.label;
        menu.appendChild(it);
    });
    document.body.appendChild(menu);
    let cur = null;
    menu.addEventListener('click', function (e) {
        const it = e.target.closest('.menu-item');
        if (!it)
            return;
        const act = it.dataset.action;
        if (!act || !cur)
            return;
        const msg = cur.querySelector('.message');
        if (!msg)
            return;
        switch (act) {
            case 'quote': {
                const md = toMd(msg);
                if (!md)
                    break;
                const inp = getInput();
                if (!inp) {
                    console.warn('[Luogu Chat Better] Cannot find chatbox');
                    break;
                }
                const sep = cfg.quoteSeparator || '||';
                const txt = sep + ' ' + md;
                setInput(inp, txt);
                break;
            }
            case 'copy': {
                const txt = msg.textContent;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(txt).catch(() => fallbackCopy(txt));
                }
                else {
                    fallbackCopy(txt);
                }
                function fallbackCopy(t) {
                    const ta = document.createElement('textarea');
                    ta.value = t;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    ta.remove();
                }
                break;
            }
        }
        menu.style.display = 'none';
        cur = null;
    });
    document.addEventListener('click', function (e) {
        if (menu.style.display === 'none')
            return;
        if (!menu.contains(e.target)) {
            menu.style.display = 'none';
            cur = null;
        }
    });
    document.addEventListener('click', function (e) {
        if (menu.contains(e.target))
            return;
        const block = e.target.closest('.message-block');
        if (!block)
            return;
        const msg = e.target.closest('.message');
        if (!msg || e.target.closest('a') || e.target.closest('img'))
            return;
        e.preventDefault();
        cur = block;
        menu.style.display = 'block';
        const x = Math.min(e.clientX, window.innerWidth - 160);
        const y = Math.min(e.clientY, window.innerHeight - 60);
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
    });
})();
