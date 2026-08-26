import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { toUserError } from '../lib/to-user-error';
import { colors } from '../theme';
import { AppText } from './AppText';
import { GoldButton } from './GoldButton';
import { Screen } from './Screen';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { error: null };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Arcanum ErrorBoundary', error.message, info.componentStack);
  }

  private reset = (): void => {
    this.setState({ error: null });
  };

  public render(): ReactNode {
    if (this.state.error !== null) {
      return <ErrorFallback error={this.state.error} onReset={this.reset} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  return (
    <Screen>
      <View style={styles.body}>
        <AppText variant="kicker">Interrupção</AppText>
        <AppText variant="title" style={styles.title}>
          O mapa encontrou um véu inesperado
        </AppText>
        <AppText variant="body" style={styles.copy}>
          {toUserError(error)}
        </AppText>
      </View>
      <GoldButton
        label="Voltar ao Início"
        onPress={() => {
          onReset();
          try {
            router.replace('/');
          } catch {
            // O navigator pode estar desmontado; o reset já reabre a árvore.
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  copy: {
    color: colors.mist,
    maxWidth: 360,
  },
});
