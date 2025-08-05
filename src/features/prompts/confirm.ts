import inquirer from 'inquirer';

export async function promptConfirm(message: string, defaultValue = false): Promise<boolean> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message,
      default: defaultValue,
    },
  ]);
  return confirm;
}

export async function promptPrivateRepositoryAccessConfirm() {
  return promptConfirm('Do you want to proceed with private repository access?');
}

export async function promptPersonalAccessTokenModeConfirm(): Promise<boolean> {
  return promptConfirm(
    '🔐 Do you want to use Personal Access Token mode? (Token will not be stored.)',
  );
}
