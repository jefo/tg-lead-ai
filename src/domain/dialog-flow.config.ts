// src/domain/dialog-flow.config.ts

/**
 * This configuration object represents the entire dialog flow graph.
 * It's a declarative representation of the UX defined in `ux.md`.
 * The state machine runner in the application layer will use this as its source of truth.
 */

export interface DialogFlowConfig {
  initial: string;
  states: {
    [key: string]: {
      message?: {
        text: string;
        buttons: string[];
      };
      on?: {
        [key: string]: {
          target: string;
          actions?: string[];
        };
      };
      // An action to run upon entering the state
      entry?: string[];
    };
  };
}

export const dialogFlow: DialogFlowConfig = {
  initial: 'AWAITING_START',
  states: {
    AWAITING_START: {
      message: {
        text: 'Здравствуйте! Я AI-Стратег.\n\nЯ задам вам 3 вопроса о вашем бизнесе, чтобы составить персональный маркетинговый план. Это займет не более минуты.',
        buttons: ['Начать'],
      },
      on: {
        // We can map button text directly to events
        'Начать': { target: 'AWAITING_INDUSTRY' },
      },
    },
    AWAITING_INDUSTRY: {
      message: {
        text: 'Отлично!\n\nШаг 1 из 3: Выберите вашу отрасль.',
        buttons: ['B2B Логистика', 'E-commerce', 'Финтех', 'IT-услуги'],
      },
      on: {
        // A wildcard event can handle any button click if the logic is the same
        '*': {
          target: 'AWAITING_BUDGET',
          actions: ['saveIndustry'],
        },
      },
    },
    AWAITING_BUDGET: {
      message: {
        text: 'Шаг 2 из 3: Какой у вас ориентировочный месячный бюджет на маркетинг?',
        buttons: ['< 100 000 ₽', '100 000 - 500 000 ₽', '> 500 000 ₽'],
      },
      on: {
        '*': {
          target: 'AWAITING_GOAL',
          actions: ['saveBudget'],
        },
      },
    },
    AWAITING_GOAL: {
      message: {
        text: 'Шаг 3 из 3: Какая ваша основная маркетинговая цель сейчас?',
        buttons: ['Привлечение новых клиентов', 'Повышение узнаваемости бренда', 'Возврат существующих клиентов'],
      },
      on: {
        '*': {
          target: 'GENERATING_PLAN',
          actions: ['saveGoal'],
        },
      },
    },
    GENERATING_PLAN: {
      entry: ['triggerPlanGeneration'],
      message: {
        text: 'Спасибо! Анализирую ваши ответы и составляю план...', 
        buttons: [],
      },
      // The transition to the next state will be triggered by an internal event
      on: {
        _PLAN_GENERATED: { target: 'PLAN_DELIVERED' },
      },
    },
    PLAN_DELIVERED: {
      // The message for this state is dynamic and will be composed by the use case.
      // We define a placeholder and the button.
      message: {
        text: 'Ваш маркетинговый план готов:',
        buttons: ['Связаться с экспертом'],
      },
      on: {
        'Связаться с экспертом': { target: 'LEAD_QUALIFIED' },
      },
    },
    LEAD_QUALIFIED: {
      entry: ['notifyOwner'],
      message: {
        text: 'Отлично! Ваша заявка принята.\n\nНаш эксперт скоро свяжется с вами для уточнения деталей. Спасибо!',
        buttons: [],
      },
      on: {
        // After a short delay, we could transition back to the start
        _END: { target: 'AWAITING_START' },
      },
    },
  },
};
