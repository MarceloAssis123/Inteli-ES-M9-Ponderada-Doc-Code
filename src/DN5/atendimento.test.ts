import { defineFeature, loadFeature } from 'jest-cucumber';
import { jest } from '@jest/globals';

// Carrega o arquivo .feature de Atendimento
const feature = loadFeature('./src/DN5/Gherkin.feature');

// Mock do chatbot
// - Se canResolve = true => tempoResposta = 120s (~2 min) => sucesso
// - Se canResolve = false => transfere para atendente
const chatbotResponder = jest.fn((canResolve: boolean) => {
  if (canResolve) {
    return {
      sucesso: true,
      tempoResposta: 120, // 2 minutos
      mensagem: 'Resposta em menos de 3 minutos',
    };
  }
  return {
    sucesso: false,
    mensagem: 'Transferindo para atendente humano',
  };
});

const suporteVoz = jest.fn(() => {
  return {
    sucesso: true,
    mensagem: 'Chamada com assistente de voz iniciada',
  };
});

defineFeature(feature, (test) => {
  let plataforma: string;
  let chatbotResultado: { sucesso: boolean; tempoResposta?: number; mensagem: string };

  // Scenario: Cliente recebe resposta do chatbot no WhatsApp
  test('Cliente recebe resposta do chatbot no WhatsApp', ({ given, when, then }) => {
    given(/^o cliente inicia um atendimento no WhatsApp$/, () => {
      plataforma = 'WhatsApp';
    });

    when('o chatbot recebe a mensagem', () => {
      chatbotResultado = chatbotResponder(true); // Simula resolução
    });

    then('ele deve responder em menos de 3 minutos', () => {
      expect(plataforma).toBe('WhatsApp');
      expect(chatbotResultado.sucesso).toBe(true);
      expect(chatbotResultado.tempoResposta).toBeLessThanOrEqual(180);
      expect(chatbotResultado.mensagem).toBe('Resposta em menos de 3 minutos');
    });
  });

  // Scenario: Cliente recebe resposta do chatbot no Reclame Aqui
  test('Cliente recebe resposta do chatbot no Reclame Aqui', ({ given, when, then }) => {
    given(/^o cliente inicia um atendimento no Reclame Aqui$/, () => {
      plataforma = 'Reclame Aqui';
    });

    when('o chatbot recebe a mensagem', () => {
      chatbotResultado = chatbotResponder(true);
    });

    then('ele deve responder em menos de 3 minutos', () => {
      expect(plataforma).toBe('Reclame Aqui');
      expect(chatbotResultado.sucesso).toBe(true);
      expect(chatbotResultado.tempoResposta).toBeLessThanOrEqual(180);
      expect(chatbotResultado.mensagem).toBe('Resposta em menos de 3 minutos');
    });
  });

  // Scenario: Cliente não tem sua dúvida resolvida e é transferido para um atendente
  test('Cliente não tem sua dúvida resolvida e é transferido para um atendente', ({ given, and, when, then }) => {
    given(/^o cliente inicia um atendimento no WhatsApp$/, () => {
      plataforma = 'WhatsApp';
    });

    and('o chatbot não consegue resolver a solicitação', () => {
      chatbotResultado = chatbotResponder(false);
    });

    when('o cliente solicita um atendente humano', () => {
      // Nesse mock, a chamada de chatbotResponder(false) já indica transferência
    });

    then('o sistema deve transferir o atendimento para um humano', () => {
      expect(chatbotResultado.sucesso).toBe(false);
      expect(chatbotResultado.mensagem).toBe('Transferindo para atendente humano');
    });
  });

  // Scenario: Cliente solicita suporte por voz
  test('Cliente solicita suporte por voz', ({ given, when, then }) => {
    given(/^o cliente está interagindo com o chatbot$/, () => {
      plataforma = 'Qualquer'; // Representa que já está no chatbot
    });

    when('ele solicita suporte por voz', () => {
      chatbotResultado = suporteVoz();
    });

    then('o sistema deve iniciar uma chamada com o assistente de voz', () => {
      expect(chatbotResultado.sucesso).toBe(true);
      expect(chatbotResultado.mensagem).toBe('Chamada com assistente de voz iniciada');
    });
  });
});
