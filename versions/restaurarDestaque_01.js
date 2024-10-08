/*
    Versão que o elemento fica restauravel de maneira certa...
    -- Versão do Script <02>
*/


// Função para restaurar destaques salvos com LocalDB.js (incluindo cor do texto e cor de fundo)
function restaurarDestaques() {
    // Acessar a coleção de destaques
    var databaseDestaques = new LDB.Collection('destaques');

    // Buscar todos os destaques na coleção
    databaseDestaques.find({}, function (results) {
        if (results.length === 0) {
            console.log("Nenhum destaque encontrado.");
            return;
        }

        // Agrupar os destaques por containerId e elementoIndexNodeList para processar corretamente
        const destaquesPorElemento = {};

        results.forEach(function (destaque) {
            const key = `${destaque.containerId}-${destaque.elementoIndexNodeList}`;
            if (!destaquesPorElemento[key]) {
                destaquesPorElemento[key] = [];
            }
            destaquesPorElemento[key].push(destaque);
        });

        // Processar cada grupo de destaques
        Object.keys(destaquesPorElemento).forEach(function (key) {
            const destaques = destaquesPorElemento[key];
            const primeiroDestaque = destaques[0];

            const container = document.getElementById(primeiroDestaque.containerId);
            if (!container) return;

            console.log(container)

            const elementos = container.querySelectorAll(primeiroDestaque.parentTag);
            const elementosDoMesmoTipo = Array.from(elementos); // Converte NodeList para array
            const elemento = elementosDoMesmoTipo[primeiroDestaque.elementoIndexNodeList]; // Usa o índice do NodeList

            if (!elemento) {
                console.warn(`Elemento não encontrado no índice ${primeiroDestaque.elementoIndexNodeList} para o tipo ${primeiroDestaque.parentTag}`);
                return;
            }

            let textoOriginal = elemento.textContent; // Usar textContent para preservar os espaços como caracteres
            let novoConteudo = '';
            let posicaoAtual = 0;

            // Processar todos os destaques neste elemento
            destaques.forEach(function (destaque) {
                const palavraParaMarcar = destaque.palavra;
                
                // Encontrar a palavra exata usando o Range API
                let range = document.createRange();
                let nodeIterator = document.createNodeIterator(elemento, NodeFilter.SHOW_TEXT);

                let currentNode;
                let encontrado = false;
                while ((currentNode = nodeIterator.nextNode())) {
                    let textoDoNo = currentNode.textContent;

                    let start = textoDoNo.indexOf(palavraParaMarcar);
                    if (start !== -1 && !encontrado) {
                        encontrado = true;

                        range.setStart(currentNode, start);
                        range.setEnd(currentNode, start + palavraParaMarcar.length);

                        // Criar marcador
                        let marcador = document.createElement('marcador');
                        marcador.style.backgroundColor = destaque.corFundo;
                        marcador.style.color = destaque.corTexto;
                        marcador.setAttribute("data-id", destaque.id);
                        marcador.textContent = palavraParaMarcar;

                        if (destaque.estiloTexto) {
                            marcador.style.cssText += destaque.estiloTexto;
                        }

                        range.deleteContents();
                        range.insertNode(marcador);
                    }
                }
            });
        });
    });
}