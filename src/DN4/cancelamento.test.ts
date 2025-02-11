import { defineFeature, loadFeature } from 'jest-cucumber';
import { jest } from '@jest/globals';

// Carrega o arquivo .feature de Cancelamento
const feature = loadFeature('./src/DN4/Gherkin.feature');

// Mock simples para cancelar pedido
// Valor > 1000 => bloqueia
// Valor <= 1000 => permite + taxa
// Se estiver "Em Transporte" => permite + taxa (entregador devolve)
const cancelarPedido = jest.fn((valor: number, status?: string) => {
  if (valor > 1000) {
    return {
      sucesso: false,
      mensagem: 'Cancelamento não permitido para pedidos acima de R$1000',
    };
  }

  // Se estiver em transporte, é permitido + taxa
  if (status === 'Em Transporte') {
    return {
      sucesso: true,
      mensagem: 'Cancelamento realizado, entregador deve devolver o pedido',
      aplicaTaxa: true,
    };
  }

  // Caso valor <= 1000 e não esteja em transporte
  return {
    sucesso: true,
    mensagem: 'Cancelamento realizado com taxa de R$XX',
    aplicaTaxa: true,
  };
});

// Definição dos cenários e steps
defineFeature(feature, (test) => {
  let valorPedido: number;
  let statusPedido: string | undefined;
  let resultado: {
    sucesso: boolean;
    mensagem: string;
    aplicaTaxa?: boolean;
  };

  // Scenario 1: Cancelamento acima de R$1000 não permitido
  test('Cancelamento de pedido acima de R$1000 não permitido', ({ given, when, then, and }) => {
    given(/^um pedido de R\$([0-9]+) foi realizado$/, (valor) => {
      valorPedido = parseInt(valor, 10);
      statusPedido = undefined; // não definido => não está em transporte
    });

    when('o cliente tenta cancelar o pedido', () => {
      resultado = cancelarPedido(valorPedido, statusPedido);
    });

    then('o sistema deve bloquear o cancelamento', () => {
      expect(resultado.sucesso).toBe(false);
    });

    and(/^exibir a mensagem "(.*)"$/, (mensagemEsperada) => {
      expect(resultado.mensagem).toBe(mensagemEsperada);
    });
  });

  // Scenario 2: Cancelamento abaixo de R$1000 com taxa
  test('Cancelamento de pedido abaixo de R$1000 com taxa aplicada', ({ given, when, then, and }) => {
    given(/^um pedido de R\$([0-9]+) foi realizado$/, (valor) => {
      valorPedido = parseInt(valor, 10);
      statusPedido = undefined;
    });

    when('o cliente tenta cancelar o pedido', () => {
      resultado = cancelarPedido(valorPedido, statusPedido);
    });

    then('o sistema deve permitir o cancelamento', () => {
      expect(resultado.sucesso).toBe(true);
    });

    and('aplicar uma taxa de cancelamento', () => {
      expect(resultado.aplicaTaxa).toBe(true);
    });

    and(/^exibir a mensagem "(.*)"$/, (mensagemEsperada) => {
      expect(resultado.mensagem).toBe(mensagemEsperada);
    });
  });

  // Scenario 3: Cancelamento de pedido em transporte
  test('Cancelamento de pedido em transporte', ({ given, when, then, and }) => {
    given(/^um pedido de R\$([0-9]+) está "(.*)"$/, (valor, status) => {
      valorPedido = parseInt(valor, 10);
      statusPedido = status;
    });

    when('o cliente tenta cancelar o pedido', () => {
      resultado = cancelarPedido(valorPedido, statusPedido);
    });

    then('o sistema deve permitir o cancelamento', () => {
      expect(resultado.sucesso).toBe(true);
    });

    and('aplicar uma taxa de cancelamento', () => {
      expect(resultado.aplicaTaxa).toBe(true);
    });

    and(/^exibir a mensagem "(.*)"$/, (mensagemEsperada) => {
      expect(resultado.mensagem).toBe(mensagemEsperada);
    });
  });
});
