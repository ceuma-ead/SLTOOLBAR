/*
    Versão que o é possivel atualizar o no de texto do elemento sem 
    alterar o moforlogia aplicavel a nó fragments

    -- Versão do Script <01>

*/

// Função para deletar todos os marcadores dentro da seleção
function deletarMarcacao() {
    const selection = window.getSelection();

    // Verificação inicial para garantir que há uma seleção válida
    if (!selection || selection.rangeCount === 0) {
        console.log('Nenhuma seleção encontrada.');
        return;
    }

    // Obter o range da seleção atual
    const range = selection.getRangeAt(0);
    if (!range) {
        console.log('Range inválido.');
        return;
    }

    const selectedText = range.toString().trim();
    if (!selectedText) {
        console.log('Nenhuma palavra selecionada.');
        return;
    }

    // Obter o commonAncestorContainer e garantir que seja um elemento, não um nó de texto
    let commonAncestor = range.commonAncestorContainer;
    if (commonAncestor.nodeType === 3) { // Se for um nó de texto
        commonAncestor = commonAncestor.parentElement; // Pegar o elemento pai
    }

    // Capturar todos os nós dentro do range de seleção
    const walker = document.createTreeWalker(commonAncestor, NodeFilter.SHOW_ELEMENT, {
        acceptNode: (node) => {
            return NodeFilter.FILTER_ACCEPT;
        }
    });

    const elementosSelecionados = [];
    let currentNode = walker.currentNode;

    while (currentNode) {
        if (range.intersectsNode(currentNode)) {
            elementosSelecionados.push(currentNode);
        }
        currentNode = walker.nextNode();
    }

    // Percorrer todos os elementos selecionados e remover os marcadores
    elementosSelecionados.forEach(elemento => {
        const marcadores = elemento.querySelectorAll('[data-id]');
        marcadores.forEach(marcador => {
            if (range.intersectsNode(marcador)) {
                const dataId = marcador.getAttribute('data-id');
                console.log(`Removendo marcador com data-id: ${dataId}`);

                // Criar um nó de texto com o conteúdo dentro do marcador
                const textoMarcador = document.createTextNode(marcador.textContent);

                // Substituir o marcador pelo seu conteúdo textual
                marcador.parentNode.replaceChild(textoMarcador, marcador);

                // Remover o marcador da base de dados usando LocalDB.js
                removerMarcadorDoLocalDB(dataId);
            }
        });
    });

    // Limpar a seleção após o processamento
    selection.removeAllRanges();
}

// Função para remover o marcador da base de dados usando LocalDB.js
function removerMarcadorDoLocalDB(dataId) {
    databaseDestaques.find({ id: dataId }, function (items) {
        // Verificar se existem itens correspondentes na base de dados
        if (Array.isArray(items) && items.length > 0) {
            items.forEach((item) => {
                item.delete(); // Remover o item da base de dados
                console.log(`Marcador com id ${item.id} removido da base de dados.`);
            });
        } else {
            console.log(`Nenhum marcador encontrado com o id ${dataId} na base de dados.`);
        }
    });
}

// Função para conectar o botão de limpar
document.getElementById('limpar').addEventListener('click', function () {
    deletarMarcacao();
});