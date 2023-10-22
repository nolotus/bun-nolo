export function createResponse() {
    let response: Response | null = null;
    let statusCode: number = 200;
    let headers: Headers = new Headers();
    function json(data: object) {
      headers.set('Content-Type', 'application/json');
      response = new Response(JSON.stringify(data), {
        status: statusCode,
        headers: headers
      });
      return response
    }
  
    function status(code: number) {
      statusCode = code;
      return {
        response,
        status,
        json,
        setHeader,
        write,
        end
      };
    }  

    function setHeader(name: string, value: string) {
      headers.set(name, value);
      return this;
    }
  
    function write(data: string) {
      if (response) {
        let text = response.body ? response.body.toString() + data : data;
        response = new Response(text, {
          status: statusCode,
          headers: headers
        });
      }
      return response;
    }
  
    function end() {
      return response;
    }
  
    return {
      response,
      status,
      json,
      setHeader,
      write,
      end
    };
  }
