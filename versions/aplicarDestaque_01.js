/*
    Versão que é aplicado o destaque no elemento de forma unica 
    e unitaria em unificar o node.fragments e criar um laço de 
    range.map envolta do elemento espeficidado.

    -- Versão do Script <01>

*/

// Função para aplicar o destaque ao texto selecionado
function aplicarDestaqueSelecionado(corFundo, corTexto = 'black', estiloTexto = '', elementosSelecionaveis = ['p']) {
    if (selectedRange) {
        const selection = window.getSelection();
        const range = selectedRange.cloneRange(); // Clonar o range para preservar a seleção

        const startContainer = range.startContainer;
        const endContainer = range.endContainer;

        // Função auxiliar para destacar um trecho de texto
        function highlightRange(r) {
            let newSpan = document.createElement('span');
            newSpan.style.backgroundColor = corFundo;
            newSpan.style.color = corTexto;
            if (estiloTexto) {
                newSpan.style.cssText += estiloTexto;
            }
            const fragment = r.extractContents();
            newSpan.appendChild(fragment);
            r.insertNode(newSpan);
        }

        // Se a seleção envolve apenas um nó
        if (startContainer === endContainer) {
            highlightRange(range);
        } else {
            // Processar o primeiro trecho da seleção
            const startRange = document.createRange();
            startRange.setStart(startContainer, range.startOffset);
            startRange.setEnd(startContainer, startContainer.length);
            highlightRange(startRange);

            // Processar o último trecho da seleção
            const endRange = document.createRange();
            endRange.setStart(endContainer, 0);
            endRange.setEnd(endContainer, range.endOffset);
            highlightRange(endRange);

            // Processar os nós intermediários entre o início e o fim da seleção
            let currentNode = startContainer.parentElement.nextElementSibling;
            while (currentNode && currentNode !== endContainer.parentElement) {
                if (elementosSelecionaveis.includes(currentNode.nodeName.toLowerCase())) {
                    const middleRange = document.createRange();
                    middleRange.selectNodeContents(currentNode);
                    highlightRange(middleRange);
                }
                currentNode = currentNode.nextElementSibling;
            }
        }

        // Limpar a seleção após o destaque
        selection.removeAllRanges();
    } else {
        alert("Nenhuma seleção foi feita!");
    }
}

