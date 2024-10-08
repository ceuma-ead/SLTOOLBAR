/*
    Versão que o é possivel salvar o destqye de forma finita e organizada
    de maneira programatica...

    -- Versão do Script <03>

*/


// Função para salvar o destaque no LocalStorage com metadados essenciais (incluindo cor do texto)
function salvarDestaque(palavra, corFundo, corTexto, containerId, paragrafoIndex, startOffset, endOffset, parentTag, dataHora, estiloTexto) {
    let destaques = JSON.parse(localStorage.getItem('destaques')) || [];
    const idUnico = gerarIdUnico(); // Gerar ID único para o destaque

    destaques.push({
        id: idUnico,                 // ID único
        palavra: palavra,            // Palavra destacada
        corFundo: corFundo,          // Cor de fundo aplicada
        corTexto: corTexto,          // Cor do texto aplicada
        containerId: containerId,    // ID do contêiner
        paragrafoIndex: paragrafoIndex, // Índice do parágrafo dentro do contêiner
        startOffset: startOffset,    // Posição inicial do texto destacado
        endOffset: endOffset,        // Posição final do texto destacado
        parentTag: parentTag,        // Tag do elemento pai
        dataHora: dataHora,          // Data e hora do destaque
        estiloTexto: estiloTexto     // Estilo adicional, como negrito ou itálico
    });

    localStorage.setItem('destaques', JSON.stringify(destaques));
    console.log('Destaque salvo:', palavra, corFundo, corTexto, dataHora, estiloTexto);
}

// Função para aplicar o destaque ao texto selecionado e salvar
function aplicarDestaqueSelecionado(corFundo, corTexto = 'black', estiloTexto = '', elementosSelecionaveis = ['p']) {
    if (selectedRange) {
        const selection = window.getSelection();
        const range = selectedRange.cloneRange(); // Clonar o range para preservar a seleção

        const startContainer = range.startContainer;
        const endContainer = range.endContainer;
        const container = startContainer.parentElement.closest('.editar'); // Supondo que os contêineres tenham a classe 'editar'

        if (!container) return;

        const paragrafos = container.querySelectorAll('p');
        const paragrafoIndex = Array.from(paragrafos).indexOf(startContainer.parentElement);

        // Função auxiliar para destacar um trecho de texto e salvar
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

            // Salvar o destaque
            salvarDestaque(
                newSpan.textContent,
                corFundo,
                corTexto,
                container.id,
                paragrafoIndex,
                r.startOffset,
                r.endOffset,
                'p',
                new Date().toISOString(),
                estiloTexto
            );
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
