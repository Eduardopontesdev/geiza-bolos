document.addEventListener('DOMContentLoaded', () => {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const listaCarrinho = document.getElementById('lista-carrinho');
    const totalElement = document.getElementById('total');
    const limparCarrinhoBtn = document.getElementById('limpar-carrinho');
    const finalizarCompraBtn = document.getElementById('finalizar-compra');
    const carrinhoIcon = document.getElementById('carrinho-icon');
    const carrinhoSection = document.getElementById('carrinho');
    const carrinhoCount = document.getElementById('carrinho-count');
    const fecharCarrinhoBtn = document.getElementById('fechar-carrinho');

    // Função para atualizar o carrinho
    function atualizarCarrinho() {
        listaCarrinho.innerHTML = '';
        let total = 0;

        // Agrupa itens iguais
        const itensAgrupados = carrinho.reduce((acc, item) => {
            if (acc[item.nome]) {
                acc[item.nome].quantidade += 1;
                acc[item.nome].precoTotal += item.preco;
            } else {
                acc[item.nome] = { ...item, quantidade: 1, precoTotal: item.preco };
            }
            return acc;
        }, {});

        // Exibe os itens no carrinho
        Object.values(itensAgrupados).forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${item.nome} - ${item.quantidade}x - R$ ${item.precoTotal.toFixed(2)}
                <button class="remover" data-nome="${item.nome}">Remover</button>
            `;
            listaCarrinho.appendChild(li);
            total += item.precoTotal;
        });

        totalElement.textContent = total.toFixed(2);
        carrinhoCount.textContent = carrinho.length;
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
    }

    // Adiciona produtos ao carrinho
    document.querySelectorAll('.adicionar').forEach(button => {
        button.addEventListener('click', () => {
            const produto = button.parentElement;
            const nome = produto.getAttribute('data-nome');
            const preco = parseFloat(produto.getAttribute('data-preco'));
            carrinho.push({ nome, preco });
            atualizarCarrinho();
        });
    });

    // Remove itens do carrinho
    listaCarrinho.addEventListener('click', (event) => {
        if (event.target.classList.contains('remover')) {
            const nome = event.target.getAttribute('data-nome');
            const index = carrinho.findIndex(item => item.nome === nome);
            if (index !== -1) {
                carrinho.splice(index, 1);
                atualizarCarrinho();
            }
        }
    });

    // Limpa o carrinho
    limparCarrinhoBtn.addEventListener('click', () => {
        carrinho.length = 0;
        atualizarCarrinho();
    });

    // Finaliza a compra via WhatsApp
    finalizarCompraBtn.addEventListener('click', () => {
        const total = parseFloat(totalElement.textContent);
        const mensagem = `Olá, gostaria de fazer um pedido:\n${carrinho.map(item => `${item.nome} - R$ ${item.preco.toFixed(2)}`).join('\n')}\nTotal: R$ ${total.toFixed(2)}`;
        const url = `https://wa.me/+5588996328842?text=${encodeURIComponent(mensagem)}`;
        window.open(url, '_blank');
    });

    // Abre/fecha o carrinho
    carrinhoIcon.addEventListener('click', () => {
        carrinhoSection.classList.toggle('active');
    });

    // Fecha o carrinho
    fecharCarrinhoBtn.addEventListener('click', () => {
        carrinhoSection.classList.remove('active');
    });

    // Filtro de categorias
    document.querySelectorAll('.categoria-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.categoria-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const categoria = button.getAttribute('data-categoria');
            document.querySelectorAll('.produto').forEach(produto => {
                if (categoria === 'todos' || produto.getAttribute('data-categoria') === categoria) {
                    produto.style.display = 'block';
                } else {
                    produto.style.display = 'none';
                }
            });
        });
    });

    atualizarCarrinho();
});
