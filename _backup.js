let selectedRange = null;
var databaseDestaques = new LDB.Collection('destaques');

// Função para carregar a configuração da toolbar a partir de um arquivo JSON
const toolbarConfig = async (url = "./toolbar.json") => {
    try {
        const response = await fetch(url); // Faz a requisição do arquivo JSON
        if (!response.ok) {
            throw new Error(`Erro ao carregar o arquivo: ${response.status}`);
        }
        const data = await response.json(); // Parseia o arquivo JSON
        return data; // Retorna os dados carregados
    } catch (error) {
        console.error("Erro ao carregar a configuração da toolbar:", error);
        return null;
    }
}

const response = toolbarConfig()

// Geração de ID único
function gerarIdUnico() {
    return 'destaque-' + Math.random().toString(36).substr(2, 9);
}

function salvarDestaque(palavra, corFundo, corTexto, containerId, elementoIndex, startOffset, endOffset, parentTag, dataHora, estiloTexto, elementoIndexNodeList) {
    const idUnico = gerarIdUnico(); // Gerar ID único para o destaque

    const destaque = {
        id: idUnico,                    // ID único
        palavra: palavra,               // Palavra destacada
        paginaIndex:0,                  // Salvar Página de Marcação
        corFundo: corFundo,             // Cor de fundo aplicada
        corTexto: corTexto,             // Cor do texto aplicada
        containerId: containerId,       // ID do contêiner
        elementoIndex: elementoIndex,   // Índice do elemento (p, div, etc.)
        elementoIndexNodeList: elementoIndexNodeList, // Índice do elemento dentro de sua NodeList (p, div, button, etc.)
        startOffset: startOffset,       // Posição inicial do texto destacado
        endOffset: endOffset,           // Posição final do texto destacado
        parentTag: parentTag,           // Tag do elemento pai (p, div, etc.)
        dataHora: dataHora,             // Data e hora do destaque
        estiloTexto: estiloTexto        // Estilo adicional, como negrito ou itálico
    };

    // Salva o destaque individualmente
    databaseDestaques.save(destaque, function(_item){
        // console.log('Destaque Salvo: ', _item);
    });
}

// Função para aplicar o destaque ao texto selecionado
async function aplicarDestaqueSelecionado(corFundo, corTexto = 'black', estiloTexto = '') {
    if (selectedRange) {
        const configuracao = await toolbarConfig();
        const marcarMultiplosElementos = configuracao.toolbar_configuracao.marcarMultiplosElementos;
        let elementosSelecionaveis = configuracao.toolbar_actions.elementos_marcacao;

        const selection = window.getSelection();
        const range = selectedRange.cloneRange(); // Clonar o range para preservar a seleção

        const startContainer = range.startContainer;
        const endContainer = range.endContainer;

        const containerMarcador = ['editar']; // Classes permitidas para destacar
        const container = startContainer.parentElement.closest(containerMarcador.map(cls => `.${cls}`).join(','));

        if (!container) {
            console.log('Seleção fora de contêiner permitido.');
            return;
        }

        // Selecionar apenas os elementos destacáveis (p, div, button, etc.) dentro do container
        const elementos = Array.from(container.children).filter(el => 
            elementosSelecionaveis.includes(el.nodeName.toLowerCase())
        );

        // Função auxiliar para destacar um trecho de texto
        function highlightRange(r, elementoIndex, tagName, elementoIndexNodeList) {
            let marcador = document.createElement('marcador');
            marcador.style.backgroundColor = corFundo;
            marcador.style.color = corTexto;
            if (estiloTexto) {
                marcador.style.cssText += estiloTexto;
            }
            const fragment = r.extractContents();
            marcador.appendChild(fragment);
            r.insertNode(marcador);

            // Salvar o destaque
            salvarDestaque(
                marcador.textContent,
                corFundo,
                corTexto,
                container.id,               // ID do contêiner correto
                elementoIndex,              // Índice do elemento (p, div, etc.)
                r.startOffset,              // Offset inicial do texto
                r.endOffset,                // Offset final do texto
                tagName.toLowerCase(),      // Tag do elemento pai (p, div, etc.)
                new Date().toISOString(),   // Data e hora
                estiloTexto,                // Estilo adicional
                elementoIndexNodeList       // Índice na NodeList dos elementos do mesmo tipo
            );
        }

        // Função para calcular corretamente o elementoIndex e elementoIndexNodeList
        function calcularIndices(startContainer) {
            const elementoPai = startContainer.parentElement;
            const elementoIndex = elementos.indexOf(elementoPai);

            // Verificar se o elemento é um marcador dentro de outro marcador
            const marcadorPai = elementoPai.closest('marcador');

            if (marcadorPai) {
                // Se for um marcador dentro de outro marcador, garantir que o índice seja calculado corretamente
                const marcadoresNoContainer = Array.from(container.querySelectorAll('marcador'));
                const elementoIndexNodeList = marcadoresNoContainer.indexOf(marcadorPai);
                return { elementoIndex, elementoIndexNodeList };
            } else {
                // Caso não seja um marcador dentro de outro
                const elementosDoMesmoTipo = elementos.filter(el => el.nodeName.toLowerCase() === elementoPai.nodeName.toLowerCase());
                const elementoIndexNodeList = elementosDoMesmoTipo.indexOf(elementoPai);
                return { elementoIndex, elementoIndexNodeList };
            }
        }

        // Se a seleção envolve apenas um nó
        if (startContainer === endContainer) {
            const { elementoIndex, elementoIndexNodeList } = calcularIndices(startContainer);
            highlightRange(range, elementoIndex, startContainer.parentElement.tagName, elementoIndexNodeList);
        } else {
            // Processar o primeiro trecho da seleção
            const startRange = document.createRange();
            startRange.setStart(startContainer, range.startOffset);
            startRange.setEnd(startContainer, startContainer.length);
            const { elementoIndex: startIndex, elementoIndexNodeList: elementoIndexNodeListStart } = calcularIndices(startContainer);

            highlightRange(startRange, startIndex, startContainer.parentElement.tagName, elementoIndexNodeListStart);

            // Se marcar múltiplos elementos for permitido
            if (marcarMultiplosElementos) {
                // Processar o último trecho da seleção
                const endRange = document.createRange();
                endRange.setStart(endContainer, 0);
                endRange.setEnd(endContainer, range.endOffset);
                const { elementoIndex: endIndex, elementoIndexNodeList: elementoIndexNodeListEnd } = calcularIndices(endContainer);

                highlightRange(endRange, endIndex, endContainer.parentElement.tagName, elementoIndexNodeListEnd);

                // Processar os nós intermediários entre o início e o fim da seleção
                let currentNode = startContainer.parentElement.nextElementSibling;
                while (currentNode && currentNode !== endContainer.parentElement) {
                    if (elementosSelecionaveis.includes(currentNode.nodeName.toLowerCase())) {
                        const middleRange = document.createRange();
                        middleRange.selectNodeContents(currentNode);
                        const middleIndex = elementos.indexOf(currentNode);

                        const elementosDoMesmoTipoMiddle = elementos.filter(el => el.nodeName.toLowerCase() === currentNode.nodeName.toLowerCase());
                        const elementoIndexNodeListMiddle = elementosDoMesmoTipoMiddle.indexOf(currentNode);

                        highlightRange(middleRange, middleIndex, currentNode.nodeName, elementoIndexNodeListMiddle);
                    }
                    currentNode = currentNode.nextElementSibling;
                }
            }
        }

        // Limpar a seleção após o destaque
        selection.removeAllRanges();
    } else {
        alert("Nenhuma seleção foi feita!");
    }
}

// Evento para exibir a toolbar após seleção de texto
document.addEventListener('mouseup', async function (e) {
    const selection = window.getSelection();
    const textoSelecionado = selection.toString().trim();
    const toolbar = document.getElementById('toolbar');

    const configuracao = await toolbarConfig();
    // console.log(configuracao)

    // Variáveis de controle
    const elementosSelecionaveis = configuracao.toolbar_actions.elementos_selecao; // Elementos que podem ser selecionados
    const classesPermitidas = ['editar']; // Classes permitidas para exibir a toolbar
    let selecionarTodosElementos = configuracao.toolbar_configuracao.selecionarTodosElementos; // Mudar para true para selecionar múltiplos elementos

    // console.log(configuracao)

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
            // Caso selecionarTodosElementos seja falso, considerar apenas o primeiro elemento
            if (!selecionarTodosElementos) {
                const rangeBox = startElemento.getBoundingClientRect();
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
                // Quando selecionarTodosElementos for true, calcular o range entre o início e o fim da seleção
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
            }
        } else {
            // Se os elementos não forem válidos ou a seleção está fora das classes permitidas
            toolbar.style.display = 'none';
            selectedRange = null; // Limpar o range salvo
        }
    }
});

// Ocultar toolbar ao clicar fora dela
document.addEventListener('mousedown', function (e) {
    if (!document.getElementById('toolbar').contains(e.target)) {
        document.getElementById('toolbar').style.display = 'none';
        document.getElementById('boxMarcaCores').style.display = 'none';
    }
});

// Exibir a caixa de cores ao clicar em "Destacar"
document.getElementById('destacar').addEventListener('click', function () {
    const boxMarcaCores = document.getElementById('boxMarcaCores');
    boxMarcaCores.style.display = 'block';
});

// Aplicar cor ao texto selecionado ao clicar na paleta de cores
document.querySelectorAll('.corTexto').forEach(function (colorSpan) {
    colorSpan.addEventListener('click', function () {
        const corFundo = this.getAttribute('data-cor');
        const corTexto = this.getAttribute('data-color');
        aplicarDestaqueSelecionado(corFundo, corTexto);
        document.getElementById('boxMarcaCores').style.display = 'none';
    });
});

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

// Restaurar destaques ao carregar a página
window.onload = function () {
    restaurarDestaques();
};

// Gerar IDs únicos para cada bloco com a classe 'editar' ou 'editarParagrafo'
document.querySelectorAll('.editar, .editarParagrafo').forEach((element, index) => {
    // console.log(element)
    element.id = `${element.className}-${index}`;
});

// Função para deletar a parte do texto selecionado dentro de qualquer elemento com data-id
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

    // Capturar o elemento pai do início e fim do range
    const elementoPaiInicio = range.startContainer.parentElement.closest('p');
    const elementoPaiFim = range.endContainer.parentElement.closest('p');

    // Se a seleção atravessar mais de um parágrafo, cancelar a operação
    if (elementoPaiInicio !== elementoPaiFim) {
        alert('Selecione apenas um elemento por vez')
        // console.log('Seleção abrange múltiplos parágrafos. Operação cancelada.');
        return;
    }

    // Continuar com o processamento apenas para um parágrafo
    const elementoPai = elementoPaiInicio;

    // Verificar se o elemento pai ou algum ancestral tem o atributo data-id (marcador)
    const elementoComDataId = elementoPai.querySelector('[data-id]');
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

    // Limpar a seleção após o processamento
    selection.removeAllRanges();
}

// Função para conectar o botão de limpar
document.getElementById('limpar').addEventListener('click', function () {
    deletarMarcacao();
});

// Função para obter apenas a primeira palavra da seleção
function obterPrimeiraPalavra() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    // Obter o texto completo da seleção
    const textoSelecionado = range.toString().trim();

    // Quebrar o texto em palavras e pegar a primeira palavra
    const primeiraPalavra = textoSelecionado.split(' ')[0];

    return primeiraPalavra;
}

// Função para simular busca no dicionário
function buscarNoDicionario(palavra) {
    if (palavra) {
        alert(`Busca no dicionário para a palavra: ${palavra}`);
    } else {
        alert("Por favor, selecione uma palavra válida.");
    }
}

// Adicionar evento ao botão "Dicionário" da toolbar
document.getElementById('dicionario-toolbar').addEventListener('click', function () {
    const primeiraPalavra = obterPrimeiraPalavra();

    if (primeiraPalavra) {
        buscarNoDicionario(primeiraPalavra);
    } else {
        alert("Por favor, selecione uma palavra válida.");
    }
});
