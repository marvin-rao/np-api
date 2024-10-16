import { useState, useEffect } from 'react';

type FetchOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
};

type UseFetchWithTokenProps = {
  url: string;
  token: string;
  options?: FetchOptions;
};

export const useFetchWithToken = ({
  url,
  token,
  options = {},
}: UseFetchWithTokenProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          method: options.method || 'GET',
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options.body),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, token, options]);

  return { data, loading, error };
};
