document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://api-geiza-bolos.vercel.app/'; // Substitua pelo endereço correto da sua API
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const listaCarrinho = document.getElementById('lista-carrinho');
    const totalElement = document.getElementById('total');
    const limparCarrinhoBtn = document.getElementById('limpar-carrinho');
    const finalizarCompraBtn = document.getElementById('finalizar-compra');
    const carrinhoIcon = document.getElementById('carrinho-icon');
    const carrinhoSection = document.getElementById('carrinho');
    const carrinhoCount = document.getElementById('carrinho-count');
    const fecharCarrinhoBtn = document.getElementById('fechar-carrinho');
    const filtroCategorias = document.getElementById('filtro-categorias');
    const produtosSection = document.getElementById('produtos');

    // Função para carregar categorias
    async function carregarCategorias() {
        try {
            const response = await fetch(`${API_URL}/categorias`);
            const categorias = await response.json();
            categorias.forEach(categoria => {
                const button = document.createElement('button');
                button.className = 'categoria-btn';
                button.setAttribute('data-categoria', categoria);
                button.textContent = categoria;
                button.addEventListener('click', () => filtrarProdutos(categoria));
                filtroCategorias.appendChild(button);
            });
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }

    // Função para carregar produtos
    async function carregarProdutos() {
        try {
            const response = await fetch(`${API_URL}/produtos`);
            const produtos = await response.json();
            produtosSection.innerHTML = '';
            produtos.forEach(produto => {
                const produtoDiv = document.createElement('div');
                produtoDiv.className = 'produto';
                produtoDiv.setAttribute('data-categoria', produto.categoria);
                produtoDiv.setAttribute('data-nome', produto.nome);
                produtoDiv.setAttribute('data-preco', produto.valor);
                produtoDiv.innerHTML = `
                    <img src="${produto.imagem}" alt="${produto.nome}" />
                    <h2>${produto.nome}</h2>
                    <span class="descricao-produto">${produto.descricao}</span>
                    <p>R$ ${produto.valor.toFixed(2)}</p>
                    <button class="adicionar">Adicionar ao Carrinho</button>
                `;
                produtosSection.appendChild(produtoDiv);
            });
            adicionarEventosAosBotoes();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    }

    // Função para filtrar produtos por categoria
    function filtrarProdutos(categoria) {
        document.querySelectorAll('.categoria-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.categoria-btn[data-categoria="${categoria}"]`).classList.add('active');
        document.querySelectorAll('.produto').forEach(produto => {
            if (categoria === 'todos' || produto.getAttribute('data-categoria') === categoria) {
                produto.style.display = 'block';
            } else {
                produto.style.display = 'none';
            }
        });
    }

    // Função para adicionar eventos aos botões de adicionar ao carrinho
    function adicionarEventosAosBotoes() {
        document.querySelectorAll('.adicionar').forEach(button => {
            button.addEventListener('click', () => {
                const produto = button.parentElement;
                const nome = produto.getAttribute('data-nome');
                const preco = parseFloat(produto.getAttribute('data-preco'));
                carrinho.push({ nome, preco });
                atualizarCarrinho();
            });
        });
    }

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

    // Carrega as categorias e produtos ao iniciar
    carregarCategorias();
    carregarProdutos();
});