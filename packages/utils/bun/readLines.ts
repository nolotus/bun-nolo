export async function* readLines(stream:ReadableStream) {
    let reader = stream.getReader();
    let decoder = new TextDecoder('utf-8');
    let value, done;
    let dataSegment = '';

    while (true) {
        ({value, done} = await reader.read());
        dataSegment += decoder.decode(value);

        let lines = dataSegment.split('\n');
        if(lines.length > 1) {
            for(let i = 0; i < lines.length - 1; i++) {
                yield lines[i];
            }
            dataSegment = lines[lines.length - 1];
        }

        if(done) {
            break;
        }
    }

    yield dataSegment + decoder.decode(value);
}