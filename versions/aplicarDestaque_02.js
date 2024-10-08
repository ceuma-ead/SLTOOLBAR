/*
    Versão que o elemento fica selecionavel apenas na class que está definida
    para aparecer os elementos selecionaveis, se não for nessa class o toolbar
    não aparece...

    -- Versão do Script <02>

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

// Evento para exibir a toolbar após seleção de texto
document.addEventListener('mouseup', function (e) {
    const selection = window.getSelection();
    const textoSelecionado = selection.toString().trim();
    const toolbar = document.getElementById('toolbar');

    // Variáveis de controle
    const elementosSelecionaveis = ['p']; // Elementos que podem ser selecionados
    const classesPermitidas = ['editar']; // Classes permitidas para exibir a toolbar
    let selecionarTodosElementos = true; // Mudar para true para selecionar múltiplos elementos

    if (textoSelecionado) {
        const range = selection.getRangeAt(0);
        const startContainer = range.startContainer;
        const endContainer = range.endContainer;

        // Função para verificar se o elemento faz parte de uma das classes permitidas
        const dentroDeClassePermitida = (elemento) => {
            return classesPermitidas.some(classe => elemento.closest(`.${classe}`));
        };

        const startElemento = startContainer.parentElement.closest(elementosSelecionaveis.join(','));
        const endElemento = endContainer.parentElement.closest(elementosSelecionaveis.join(','));

        // Verifica se o elemento inicial e final são válidos e estão dentro das classes permitidas
        if (startElemento && endElemento && dentroDeClassePermitida(startElemento) && dentroDeClassePermitida(endElemento)) {
            const rangeBox = range.getBoundingClientRect();
            const toolbarHeight = toolbar.offsetHeight;
            const toolbarWidth = toolbar.offsetWidth;

            let topPosition = rangeBox.top - 40; // Ajuste para ficar acima da palavra
            let leftPosition = rangeBox.left;

            // Garantir que a toolbar fique dentro da tela (horizontalmente)
            if (leftPosition + toolbarWidth > window.innerWidth) {
                leftPosition = window.innerWidth - toolbarWidth;
            } else if (leftPosition < 0) {
                leftPosition = 0;
            }

            // Ajuste da posição para cima ou abaixo, dependendo do espaço disponível
            if (topPosition < 0) {
                topPosition = rangeBox.bottom + window.scrollY + 10; // Mostrar abaixo do texto se não houver espaço acima
            }

            // Aplicar as posições calculadas
            toolbar.style.left = `${leftPosition}px`;
            toolbar.style.top = `${topPosition}px`;
            toolbar.style.display = 'block';

            // Salvar as posições calculadas para que a toolbar não mude de posição ao abrir a caixa de cores
            toolbar.dataset.left = leftPosition;
            toolbar.dataset.top = topPosition;

            // Salvar o range selecionado para ser usado posteriormente
            selectedRange = selection.getRangeAt(0);
        } else {
            // Se os elementos não forem válidos ou a seleção está fora das classes permitidas
            toolbar.style.display = 'none';
            selectedRange = null; // Limpar o range salvo
        }
    }
});




