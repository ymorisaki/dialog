import '../scss/main.scss';

(() => {
    'use strict';

    document.documentElement.setAttribute('data-script-enabled', true);

    const DOC = document.documentElement;
    const FOCUSABLE = 'a, area, input, button, select, option, textarea, output, summary, video, audio, object, embed, iframe';

    class Dialog {
        constructor(root) {
            this.root = root;
            this.content = this.root.querySelector('.js-dialog__content');
            this.hook = this.root.querySelector('.js-dialog__hook');
            this.lead = this.root.querySelector('.js-dialog__lead');
            this.closeButton = document.createElement('button');
            this.buttonSpan = document.createElement('span');
            this.overlay = null;
            this.isOpen = false;
            this.focusableElement = null;

            // 関数実行
            this.createElement();
            this.setA11y();
        }

        /**
         * JS有効時に必要な要素の生成と設置
         * @returns void
         */
        createElement() {
            const createCloseButton = () => {
                return new Promise(resolve => {
                    this.buttonSpan.textContent = 'ダイアログを閉じる';
                    this.closeButton.appendChild(this.buttonSpan);
                    this.closeButton.setAttribute('type', 'button');
                    this.closeButton.classList.add('js-close-btn');
                    this.closeButton.classList.add('dialog__close-btn');
                    this.content.appendChild(this.closeButton);
                    resolve();
                })
            }

            // ダイアログ制御用のボタンを生成した後にイベントハンドラを登録
            createCloseButton().then(() => {
                this.focusableElement = this.content.querySelectorAll(FOCUSABLE);
                this.clickEvent();
                this.keyEvent();
            })

            // 一度だけオーバーレイ要素を生成する
            if (document.querySelectorAll('.dialog-overlay').length === 0) {
                this.overlay = document.createElement('div');
                this.overlay.classList.add('dialog-overlay');
                document.querySelector('body').appendChild(this.overlay);
            }
        }

        /**
         * JS有効時に必要なWAI-ARIAの付与
         * @returns void
         */
        setA11y() {
            this.content.setAttribute('role', 'dialog');
            this.content.setAttribute('aria-labelledby', this.lead.getAttribute('id'));
            this.hook.setAttribute('aria-expanded', false);
        }

        /**
         * モーダル表示のイベントハンドラ
         */
        openDialog() {
            DOC.style.overflow = 'hidden';
            this.content.classList.add('is-block');
            this.overlay.classList.add('is-block');
            this.hook.setAttribute('aria-expanded', true);
            this.content.setAttribute('tabindex', 0);
            this.content.focus();

            setTimeout(() => {
                this.content.classList.add('is-visible');
                this.overlay.classList.add('is-visible');
                this.content.removeAttribute('tabindex');
            }, 10);

            this.content.addEventListener('transitionend', () => {
                this.transitionEvent();
            });
        }

        /**
         * モーダル非表示のイベントハンドラ
         * @returns void
         */
        closeDialog() {
            this.content.classList.remove('is-visible');
            this.overlay.classList.remove('is-visible');
            this.hook.setAttribute('aria-expanded', false);
            this.hook.focus();

            this.content.addEventListener('transitionend', () => {
                this.transitionEvent();
            });
        }

        /**
         * アニメーション終了後の処理
         * @returns void
         */
        transitionEvent() {
            switch (this.content.classList.contains('is-visible')) {
            case true:
                this.isOpen = true;
                break
            case false:
                this.root.removeAttribute('tabindex');
                this.content.classList.remove('is-block');
                this.overlay.classList.remove('is-block');
                this.isOpen = false;
                DOC.style.overflow = '';
                break;
            default:
                break;
            }
        }

        /**
         * クリック関連のイベントをまとめる関数
         * @returns void
         */
        clickEvent() {
            // 初回クリック時に空のoverlayにオブジェクトを代入
            if (!this.overlay) {
                this.overlay = document.querySelector('.dialog-overlay');
            }

            this.hook.addEventListener('click', () => {
                this.openDialog();
            });

            this.closeButton.addEventListener('click', () => {
                this.closeDialog();
            });

            this.content.addEventListener('click', e => {
                if (!e.target.classList.contains('js-dialog__content')) {
                    return;
                }

                this.closeDialog();
            });

            this.overlay.addEventListener('click', () => {
                // overlayはモーダル共通の要素のため全てのダイアログが連動しないように処理
                if (!this.isOpen) {
                    return;
                }

                this.closeDialog();
            });
        }

        /**
         * キーボード入力関連のイベントをまとめる関数
         * @returns void
         */
        keyEvent() {
            this.closeButton.addEventListener('keydown', e => {
                if (e.key === 'Tab' && e.shiftKey) {
                    return;
                }
                if (e.key === 'Tab') {
                    e.preventDefault();
                    this.focusableElement[0].focus();
                }
            });

            this.focusableElement[0].addEventListener('keydown', e => {
                if (e.key === 'Tab' && e.shiftKey) {
                    e.preventDefault();
                    this.closeButton.focus();
                }
            });
        }
    }

    document.querySelectorAll('.js-dialog').forEach(el => {
        new Dialog(el);
    });
})();
