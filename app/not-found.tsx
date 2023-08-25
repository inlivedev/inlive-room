import HTTPError from '@/_shared/components/errors/http-error';

export default function NotFound() {
  return (
    <HTTPError
      code={404}
      title="Page Not Found"
      description="There is nothing to see on this page"
    />
  );
}
