import inquirer from 'inquirer';

export async function promptSecureInput(
  prompt: string = '🔐 Enter your secure information: ',
  validate?: (input: string) => { isValid: boolean; message?: string },
) {
  const { secureInput } = await inquirer.prompt([
    {
      type: 'password',
      name: 'secureInput',
      message: prompt,
      mask: '*',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return '❌ Input cannot be empty.';
        }
        if (validate && !validate(input).isValid) {
          return `${validate(input).message}`;
        }
        return true;
      },
    },
  ]);
  return secureInput.trim();
}

export async function promptSecureToken(
  prompt: string = '🔐 Enter your GitHub Personal Access Token (min 10 characters): ',
): Promise<string> {
  const { secureInput } = await promptSecureInput(
    prompt,
    (input: string): { isValid: boolean; message?: string } => {
      if (input.trim().length < 10) {
        return { isValid: false, message: '❌ Token seems too short. Please check your input.' };
      }
      return { isValid: true };
    },
  );

  return secureInput.trim();
}
