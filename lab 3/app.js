//Shaders
            //Vertex shader program
            const vsSource =`#version 300 es
            in vec4 aVertexPosition; // input from the cpu
            in vec4 aVertexColor;
            //attributes recieve values from buffers 

            uniform mat4 uProjectionMatrix; // input from the cpu 
            uniform mat4 uModelViewMatrix; // input from the cpu  
            //uniforms are equivalent to globar variables 

            out lowp vec4 fColor;

            void main()
            {   //gl_Position should be named exactly like this 'Special Variable'
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                fColor = aVertexColor;
            }`;

            //Fragment Shader program
            const fsSource = `#version 300 es
            precision mediump float;
            in vec4 fColor;
            out vec4 finalColor;            
            
            void main()
            {
                //gl_FragColor should be named exactly like this 'Special Variable'
                //finalColor = vec4(1.0,1.0,1.0,1.0);
                //gl_FragColor = vColor;
                
                finalColor = fColor;
            }
            `;



// start here
main();

function main()
{   
    //get element by if from html
    const canvas = document.querySelector("#glCanvas");
    
    // Initialize the GL context 
    const gl =canvas.getContext("webgl2");

        
    if(!gl)
    {
        alert("Unable to initialize WebGL.. Maybe not supported.");
        return;
    }

    const shaderProgram = initShaderProgram(gl,vsSource,fsSource);

    const programInfo = { //JSON object 
    program : shaderProgram,

    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram,'aVertexPosition'),
        vertexColor:gl.getAttribLocation(shaderProgram,'aVertexColor')
    } ,

    uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram,'uProjectionMatrix'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram,'uModelViewMatrix')
    }

};


buffers = initBuffers(gl);
drawScene(gl,programInfo,buffers);    

}


//Initialize a shader program, compile + linking 
function initShaderProgram(gl,vsSource,fsSource)
{
    const vertexShader = loadShader(gl,gl.VERTEX_SHADER,vsSource);
    const fragmentShader = loadShader(gl,gl.FRAGMENT_SHADER,fsSource);

    // Create the shader program 
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram,vertexShader);
    gl.attachShader(shaderProgram,fragmentShader);
    gl.linkProgram(shaderProgram);

    // error handling
    if(!gl.getProgramParameter(shaderProgram,gl.LINK_STATUS))
    {
        alert('Unable to initialize the shader program:' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;

}


function loadShader(gl,type,source)
{   
    // create a shader
    const shader = gl.createShader(type);
    
    // send the source code
    gl.shaderSource(shader,source);

    // compile 
    gl.compileShader(shader);

    // error handling
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))
    {
        alert('error during compile the shader' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
        return shader;

}


function initBuffers(gl)
{
    // create a buffer for the square's positions.

    const positionBuffer = gl.createBuffer();
    
    // 1 (from the gate to the GPU)
    gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);

    // Now create array of positions for the square to draw 

    const positions = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0
    ];

    // 2 (from the cpu to the gate)
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW); // static to be very close to the GPU



    // Create a buffer for the colors 
    const colors=[1.0,1.0,1.0,1.0,//white
                1.0,0.0,0.0,1.0,//red
                0.0,1.0,0.0,1.0,//green
                0.0,0.0,1.0,1.0,//blue
            ];
        
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colors),gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        color:colorBuffer,
    };

}


function drawScene(gl,programInfo,buffers)
{

    // Set clear color to black or gray, fully opaque
    gl.clearColor(0.0,0.0,0.0,.5);
    gl.clearDepth(1.0); // clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // 

    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    // create prespictive matrix 
    const fieldOfView = 45*Math.PI/180; //inradians
    const aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
    const zNear=0.1;
    const zFar=100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix,fieldOfView,aspect,zNear,zFar);
    // create modelView matrix
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix,modelViewMatrix,[0.0,0.0,-7.0]); // -6 in the z direction

    // Tell WebGL how to pull out the positions from the positions buffer to the attribute
    {  
    const numComponents = 2 ;// pull out 2 values per iteration
    const type = gl.FLOAT; // the data in the buffer is 32 bit floats
    const normalize = false;
    const stride = 0 ; //how many bytes to get from one set of values to the next
    const offset = 0; // the starting bit
    gl.bindBuffer(gl.ARRAY_BUFFER,buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition,numComponents,type,normalize,stride,offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the color
    {
    const numComponents=4;
    const type=gl.FLOAT;
    const normalize=false;
    const stride=0;
    const offset=0;
    gl.bindBuffer(gl.ARRAY_BUFFER,buffers.color);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexColor,numComponents,type,normalize,stride,offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    }

    gl.useProgram(programInfo.program);

    // Set the shader uniforms 
    // Second parameter asks if we want to transpose the matrix
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,false,projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,false,modelViewMatrix);

    {
        const offset=0; 
        const vertexCount=4;
        gl.drawArrays(gl.TRIANGLE_STRIP,offset,vertexCount);
    }
}