const formEl = $('#form');

formEl.submit((e) => { e.preventDefault(); });

const options = {};

formEl.find('input').not(':submit').not(':radio').each(function ()
{
    let input = $(this);
    let inputName = input.attr('name');

    options[inputName] = input;
});

formEl.find('select').toArray().forEach((el) =>
{
    let select = $(el);
    let selectName = select.attr('name');

    options[selectName] = select;
});

console.log(options)

const calcularButtonEl = $('#calcular');

const tableEl = $('.table');

const backboneRowEl = $('#backbone');

let equipamentos = [];

const possuiPrimarioInputs = $('input[name="possui-primario"]');
const possuiSecundarioInputs = $('input[name="possui-secundario"]');

const containerBackbonePrimarioEl = $('#container-backbone-primario');
const containerBackboneSecundarioEl = $('#container-backbone-secundario');

let possuiPrimario = !!parseInt($('input[name="possui-primario"]:checked').val());
let possuiSecundario = !!parseInt($('input[name="possui-secundario"]:checked').val());

possuiPrimarioInputs.each(function ()
{
    $(this).on('click', (e) =>
    {
        possuiPrimario = !!parseInt($(this).val());
    })
});

possuiSecundarioInputs.each(function ()
{
    $(this).on('click', (e) =>
    {
        possuiSecundario = !!parseInt($(this).val());
    })
});

calcularButtonEl.on('click', (e) =>
{
    $('.inserted').remove();

    tableEl.removeClass('hidden');

        calcularBackbonePrimario();

    if (possuiSecundario)
        calcularBackboneSecundario();

    inserirLinhas();

    equipamentos = [];
});

function calcularBackbonePrimario()
{
    const caracteristicaFibra = parseInt(options['caracteristicas-primario'].val());

    const quantidadeBackbone = parseInt(options['backbone-primario'].val());

    const pares = parseInt(options['disponivel-primario'].val());

    const distancia = parseInt(options['distancia'].val());

    const paresTotal = pares * quantidadeBackbone;

    const especificacao = caracteristicaFibra < 3 ? '50 x 125µm, MM' : '9 x 125µm, SM';


    const tamanhoTotal = (distancia * 1.2) * quantidadeBackbone;

    atualizarEquipamentos('cabo-primario', `Cabo de Fibra Óptica Loose ${caracteristicaFibra < 3 ? '50 x 125µm' : '9 x 125µm'} - com ${pares} fibras`, 'metros', tamanhoTotal);

 
    const quantidadeDIO = Math.ceil((paresTotal / 2) / 24) * 2; 

    atualizarEquipamentos('dio', 'Chassi DIO com 24 portas, 1U, 19"', 'unid.', quantidadeDIO);



    const bandeja = Math.ceil((paresTotal * 2) / 12) * 2;

    atualizarEquipamentos('bandeja', "Bandeja de emenda", 'unid.', bandeja);


    const acoplador = paresTotal * 2;

    atualizarEquipamentos(`acoplador ${especificacao}`, `Acoplador óptico ${especificacao} , LC, duplo`, 'unid.', acoplador);


    const pigTail = paresTotal * 2 * 2;

    atualizarEquipamentos(`pig tail ${especificacao}`, `Pig tail ${especificacao}, 1.5m, simples, conector LC`, 'unid', pigTail);



    const cordaoOptico = paresTotal * 2;

    atualizarEquipamentos(`cordao ${especificacao}`, `Cordão Óptico ${especificacao}, 3m, Duplo, conector LC`, 'unid.', cordaoOptico);
}

function calcularBackboneSecundario()
{
    const pavimentos = parseInt(options['pavimentos'].val());

    const caracteristicaFibra = parseInt(options['caracteristicas-secundario'].val());

    const quantidadeBackbone = parseInt(options['backbone-secundario'].val());

    const paresPorCabo = parseInt(options['disponivel-secundario'].val());

    const peDireito = parseInt(options['pe-direito'].val());

    const especificacao = caracteristicaFibra < 3 ? '50 x 125µm, MM' : '9 x 125µm, SM';

    const paresPorAndar = paresPorCabo * quantidadeBackbone;
    const paresTotal = paresPorAndar * (pavimentos - 1);

    const fibrasPorAndar = paresPorAndar * 2;
    const fibrasTotal = paresTotal * 2;


    let tamanhoCabo = 0;

    for (let j = 1; j <= pavimentos - 1; j++) 
    {
        tamanhoCabo += peDireito * (j + 2);
    }

    tamanhoCabo = Math.ceil(tamanhoCabo * 1.2);

    atualizarEquipamentos('cabo-secundario', `Cabo de Fibra Óptica Tight Buffer ${caracteristicaFibra < 3 ? '50 x 125µm' : '9 x 125µm'} - com ${paresPorCabo} fibras`, 'metros', tamanhoCabo);


    const quantidadeDio = Math.ceil((paresTotal / 2) / 24);

    atualizarEquipamentos('dio', 'Chassi de DIO com 24 portas, 1U, 19"', 'unid', quantidadeDio);


    const acoplador = paresPorAndar * (pavimentos - 1);

    atualizarEquipamentos(`acoplador ${especificacao}`, `Acoplador óptico ${especificacao}, LC, duplo`, 'unid', acoplador);


    const bandeja = Math.ceil(fibrasTotal / 12);

    atualizarEquipamentos('bandeja', 'Bandeja para emenda de fibra no DIO', 'unid', bandeja);


    const tamanhoTerminador = fibrasPorAndar <= 8 ? fibrasPorAndar : 8;
    const terminadoresTotal = Math.ceil((fibrasPorAndar) / tamanhoTerminador) * (pavimentos - 1);

    atualizarEquipamentos('terminador', `Terminador Óptico, ${tamanhoTerminador}`, 'unid', terminadoresTotal);


    const pigTailInterno = fibrasTotal;

    atualizarEquipamentos(`pig tail ${especificacao}`, `Pig tail ${especificacao}, 1.5m, simples, conector LC`, 'unid', pigTailInterno);

 
    const pigTailExterno = paresTotal;

    atualizarEquipamentos(`pig tail ${especificacao}`, `Pig tail ${especificacao}, 3m, duplo, conector LC`, 'unid', pigTailExterno);


    const cordaoOptico = paresPorCabo;

    const cordaoOpticoTotal = cordaoOptico * (pavimentos - 1);

    atualizarEquipamentos(`cordao ${especificacao}`, `Cordão Óptico ${especificacao}, 3m,  duplo, conector LC`, 'unid', cordaoOpticoTotal);
}

function atualizarEquipamentos(chave, descricao, unidade, quantidade)
{
    if (equipamentos[chave] === undefined)
    {
        equipamentos[chave] = {
            descricao: descricao,
            unidade: unidade,
            quantidade: quantidade
        };

        return;
    }

    equipamentos[chave].quantidade += quantidade;
}

function inserirLinhas() 
{
    for (const key in equipamentos) 
    {
        let equipamento = equipamentos[key];

        let elements = $('.inserted');

        let trEl = $('<tr>');

        trEl.append($('<td>').text(elements.length + 1));
        trEl.append($('<td>').text(equipamento.descricao));
        trEl.append($('<td>').text(equipamento.unidade));
        trEl.append($('<td>').text(equipamento.quantidade));

        trEl.attr('class', 'inserted');

        tableEl.find(elements.last().length === 0 ? backboneRowEl : elements.last()).after(trEl);
    }
}