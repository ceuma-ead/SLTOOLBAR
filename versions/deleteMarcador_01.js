/*
    Versão que o é possivel atualizar o no de texto do elemento sem 
    alterar o moforlogia aplicavel a nó fragments

    -- Versão do Script <01>

*/



// Função para deletar a parte do texto selecionado dentro de qualquer elemento com data-id
function deletarMarcacao() {
    const selection = window.getSelection();

    if (!selection.rangeCount) {
        console.log('Nenhuma seleção encontrada.');
        return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();

    if (!selectedText) {
        console.log('Nenhuma palavra selecionada.');
        return;
    }

    // Capturar o elemento pai
    const elementoPai = range.startContainer.parentElement;

    // Verificar se o elemento pai ou algum ancestral tem o atributo data-id (marcador)
    const elementoComDataId = elementoPai.closest('[data-id]');
    if (elementoComDataId) {
        const dataId = elementoComDataId.getAttribute('data-id');
        console.log(`Elemento marcado encontrado com data-id: ${dataId}`);

        // Capturar o texto total do marcador
        const textoMarcado = elementoComDataId.textContent;

        // Verificar a posição do texto selecionado dentro do marcador
        const textoInicio = textoMarcado.indexOf(selectedText);

        // Separar a parte antes e depois do texto selecionado
        const parteAntes = textoMarcado.slice(0, textoInicio);
        const parteDepois = textoMarcado.slice(textoInicio + selectedText.length);

        // Atualizar o marcador com o texto restante (parteAntes e parteDepois)
        const textoRestante = (parteAntes + parteDepois).trim();

        if (textoRestante.length > 0) {
            // Criar um nó de texto com a parte removida (sem o marcador)
            const textoRemovidoNode = document.createTextNode(selectedText);

            // Inserir o texto removido corretamente antes ou depois do marcador atualizado
            if (parteAntes.length > 0) {
                elementoComDataId.textContent = parteAntes;
                elementoComDataId.parentNode.insertBefore(textoRemovidoNode, elementoComDataId.nextSibling);
            } else {
                elementoComDataId.textContent = parteDepois;
                elementoComDataId.parentNode.insertBefore(textoRemovidoNode, elementoComDataId);
            }

            console.log("Texto realocado fora do marcador:", textoRemovidoNode.textContent);
            console.log("Marcador atualizado:", elementoComDataId.outerHTML);
        } else {
            // Se não houver texto restante no marcador, remove ele do DOM
            elementoComDataId.remove();
            console.log("Marcador removido, pois todo o texto foi deletado.");
        }
    } else {
        console.log('Nenhum elemento marcado com data-id encontrado.');
    }

    // Exibir o texto selecionado, o elemento pai e os filhos
    const elementosFilhos = Array.from(elementoPai.childNodes);
    console.log("Texto Selecionado:", selectedText);
    console.log("Elemento Pai:", elementoPai.outerHTML); // O HTML do elemento pai
    console.log("Elementos Filhos:", elementosFilhos);   // Os elementos filhos, se houver
}

// Função para conectar o botão de limpar
document.getElementById('limpar').addEventListener('click', function () {
    deletarMarcacao();
});
