import axios, { AxiosResponse } from 'axios';

export interface HttpResponse {
  status: number;
  data: unknown;
  headers: Record<string, string>;
}

export interface HttpClient {
  post(url: string, data: unknown, headers?: Record<string, string>): Promise<HttpResponse>;
}

export class AxiosHttpClient implements HttpClient {
  async post(url: string, data: unknown, headers?: Record<string, string>): Promise<HttpResponse> {
    const response: AxiosResponse = await axios.post(url, data, { headers });
    return {
      status: response.status,
      data: response.data,
      headers: response.headers as Record<string, string>
    };
  }
}
