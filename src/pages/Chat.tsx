import { useTranslation } from 'react-i18next';
import { useRoute } from 'wouter';
import {
  AssistantMessage,
  ChatEmptyState,
  ChatTopBar,
  MainInput,
  UserMessage,
} from '../components/chat';
import { Alert } from '../components/primitives';
import { AppShell } from '../components/shells';
import { useChat } from '../lib/hooks/useChat';
import { useIsMobile } from '../lib/hooks/useIsMobile';

export default function Chat() {
  const { t } = useTranslation();
  const [, params] = useRoute<{ chatId?: string }>('/chat/:chatId?');
  const isMobile = useIsMobile();
  const {
    chatTitle,
    isNew,
    agent,
    rotateAgent,
    messages,
    draft,
    setDraft,
    send,
    inputState,
    toggleMic,
    error,
    isStreaming,
  } = useChat(params?.chatId);

  return (
    <AppShell>
      <ChatTopBar title={chatTitle} agent={agent.id} />
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            flex: 1,
            width: '100%',
            maxWidth: 780,
            margin: '0 auto',
            padding: isMobile ? '16px 16px 8px' : '24px 32px 8px',
          }}
        >
          {error && !isStreaming && (
            <div style={{ marginBottom: 16 }}>
              <Alert variant="destructive" title={t('chat.couldNotLoadAlert')}>
                {error}
              </Alert>
            </div>
          )}
          {isNew && messages.length === 0 ? (
            <ChatEmptyState agent={agent} onPickStarter={send} />
          ) : (
            messages.map((m) =>
              m.role === 'user' ? (
                <UserMessage key={m.id} time={m.time}>
                  {m.content}
                </UserMessage>
              ) : (
                <AssistantMessage
                  key={m.id}
                  agent={m.agent}
                  streaming={m.streaming}
                  copyText={m.copyText}
                  firstOfTurn
                >
                  {m.content}
                </AssistantMessage>
              ),
            )
          )}
        </div>
        <div style={{ padding: isMobile ? '8px 12px 16px' : '16px 32px 24px' }}>
          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            <MainInput
              value={draft}
              onChange={setDraft}
              onSend={send}
              onMicClick={toggleMic}
              state={inputState}
              agent={agent}
              onAgentClick={rotateAgent}
              showHint={!isMobile}
              disabled={isStreaming}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
