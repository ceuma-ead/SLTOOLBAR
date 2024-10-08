

document.querySelectorAll('.lerBtn').forEach(button => {
    button.addEventListener('click', async (event) => {
        // Pega a div pai que contém a imagem e o botão
        const selecionarImg = event.target.closest('.selecionarImg');

        // Pega a imagem dentro dessa div
        const img = selecionarImg.querySelector('img');

        // Agora você pode fazer algo com a imagem
        console.log('Imagem associada:', img.src);

        alert('Ler conteúdo da imagem: ' + img.src);

        // const question = `Ola tudo bem`;

        // const dynamicApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyBu-iiNt4oFyjwHFnsTXMJatjn7m70gp6I`;
        // const data = {
        //     contents: [
        //         {
        //             parts: [
        //                 { text: question }
        //             ]
        //         }
        //     ]
        // };

        // const requestOptions = {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(data)
        // };

        // try {

        //     // Fazendo a requisição POST usando fetch e aguardando a resposta
        //     const response = await fetch(dynamicApiUrl, requestOptions);
        //     // const response = [{}]

        //     // Verificando se a requisição foi bem-sucedida
        //     if (!response.ok) {
        //         throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
        //     }



        //     // Extraindo e processando a resposta em JSON
        //     const responseData = await response.json();

        //     // Extraindo o texto do resumo gerado pela API
        //     const resumo = responseData.candidates[0].content.parts[0].text;

        //     // Regex para extrair o conteúdo entre aspas triplas
        //     const regex = /"""\s*([\s\S]*?)\s*"""/;

        //     // Certifique-se de que o conteúdo extraído está correto e sem parágrafos desnecessários
        //     const resumoTextual = resumo.match(regex) ? resumo.match(regex)[1].trim() : resumo.trim(); // Remove espaços e quebras de linha

        //     console.log(resumoTextual)

        // } catch (error) {
        //     // Escondendo o loader em caso de erro
        //     document.getElementById('loading-resumo').style.display = 'none';
        //     console.error('Erro:', error);
        //     document.querySelector('.render-resumo-result').innerHTML = `Erro ao gerar o resumo: ${error.message}`;
        // }

    });
});


