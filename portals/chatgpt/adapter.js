/**
 * ChatGPT Portal Adapter for LLM Chat Navigator.
 *
 * ChatGPT DOM characteristics:
 * - User messages:     [data-message-author-role="user"]
 * - Assistant messages: [data-message-author-role="assistant"]
 * - Turn containers:   article[data-testid^="conversation-turn"]
 * - Main content area: main#main
 * - Branch info:       .tabular-nums (e.g. "2/2")
 * - Dark mode:         html.dark
 */

window.__LLM_NAV_ADAPTER = {
    name: 'chatgpt',

    getUserMessages() {
        return document.querySelectorAll('[data-message-author-role="user"]');
    },

    getUserMessageText(el) {
        return el.textContent || '空提示词';
    },

    getTurnContainer(userMsgEl) {
        return userMsgEl.closest('[data-testid^="conversation-turn"]')
            || userMsgEl.closest('article')
            || userMsgEl;
    },

    getAssistantForUser(userMsgEl) {
        const userTurn = this.getTurnContainer(userMsgEl);
        let sibling = userTurn.nextElementSibling;
        while (sibling) {
            const assistant = sibling.querySelector('[data-message-author-role="assistant"]');
            if (assistant) return assistant;
            if (sibling.querySelector('[data-message-author-role="user"]')) break;
            sibling = sibling.nextElementSibling;
        }
        return null;
    },

    getMainElement() {
        return document.querySelector('main#main') || document.querySelector('main');
    },

    getObserveTarget() {
        return document.querySelector('main');
    },

    getBranchInfo(turnContainer) {
        const branchDiv = turnContainer.querySelector('.tabular-nums');
        if (branchDiv && branchDiv.textContent.includes('/')) {
            return branchDiv.textContent.trim();
        }
        return null;
    },

    getHeadings(assistantEl) {
        const headings = assistantEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length > 0) return headings;

        // 思考模型场景：同一 turn 内有多个 assistant 消息，
        // 第一个是思考摘要（无标题），实际内容标题在后续消息中
        const turn = assistantEl.closest('[data-testid^="conversation-turn"]')
            || assistantEl.closest('article');
        if (!turn) return headings;
        const result = [];
        turn.querySelectorAll('[data-message-author-role="assistant"]').forEach(msg => {
            msg.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => result.push(h));
        });
        return result;
    },

    getContentRect() {
        const main = this.getMainElement();
        return main ? main.getBoundingClientRect() : null;
    },
};
