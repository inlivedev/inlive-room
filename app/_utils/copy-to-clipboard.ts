export const copyToClipboard = (text = '') => {
  return new Promise<boolean>(async (resolve) => {
    try {
      if (
        !navigator ||
        !navigator.clipboard ||
        !navigator.clipboard.writeText
      ) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.readOnly = true;
        textArea.style.opacity = '0';
        textArea.style.position = 'absolute';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        resolve(true);
      } else {
        await navigator.clipboard.writeText(text);
        resolve(true);
      }
    } catch (error) {
      console.error(error);
      resolve(false);
    }
  });
};
