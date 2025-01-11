import open from 'open';

export async function openInVSCode(): Promise<void> {
  await open('code .');
}
