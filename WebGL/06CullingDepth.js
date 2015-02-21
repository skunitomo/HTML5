
onload = function() {
	var c = document.getElementById('canvas');
	c.width = 500;
	c.height = 500;

	var chk_culling = document.getElementById('cull');
	var chk_front = document.getElementById('front');
	var chk_depth = document.getElementById('depth');

	var gl = c.getContext('webgl');

	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');
	var prg = create_program(v_shader, f_shader);

	// =========================================================
	// 
	// =========================================================
	var attLocation = new Array(2);
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	attLocation[1] = gl.getAttribLocation(prg, 'color');
	
	var attStride = new Array(2);
	attStride[0] = 3;
	attStride[1] = 4;

	var position = [
		 0.0,  1.0, 0.0,
		 1.0,  0.0, 0.0,
		-1.0,  0.0, 0.0,
		 0.0, -1.0, 0.0
	];
	var color = [
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0
	];
	var pos_vbo = create_vbo(position);
	var col_vbo = create_vbo(color);
	
	set_attribute([pos_vbo, col_vbo], attLocation, attStride);

	// =========================================================
	// 
	// =========================================================
	var index = [
		0, 1, 2,
		1, 2, 3
	];

	var ibo = create_ibo(index);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

	// =========================================================
	// 
	// =========================================================
	var uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');
	var m = new matIV();
	var mMatrix = m.identity(m.create());
	var vMatrix = m.identity(m.create());
	var pMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create());
	var tmpMatrix = m.identity(m.create());

	m.lookAt([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
	m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
	m.multiply(pMatrix, vMatrix, tmpMatrix);

	var count = 0;

	gl.depthFunc(gl.LEQUAL);

	(function () {
		if (chk_culling.checked) {
			gl.enable(gl.CULL_FACE);
		} else {
			gl.disable(gl.CULL_FACE);
		}
		if (chk_front.checked) {
			gl.frontFace(gl.CCW);
		} else {
			gl.frontFace(gl.CW);
		}
		if (chk_depth.checked) {
			gl.enable(gl.DEPTH_TEST);
		} else {
			gl.disable(gl.DEPTH_TEST);
		}

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		count++;

		var rad = (count % 360) * Math.PI / 180;
		var x = Math.cos(rad) * 1.5;
		var z = Math.sin(rad) * 1.5;

		m.identity(mMatrix);
		m.translate(mMatrix, [x, 0.0, z], mMatrix);
		m.rotate(mMatrix, rad, [1, 0, 0], mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
		gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

		m.identity(mMatrix);
		m.translate(mMatrix, [-x, 0.0, -z], mMatrix);
		m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
		gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

		gl.flush();

		setTimeout(arguments.callee, 1000 / 30);

	})();

	function create_shader(id) {
		var shader;

		var scriptElement = document.getElementById(id);

		if (!scriptElement) { return; }

		switch(scriptElement.type) {
			case 'x-shader/x-vertex':
				shader = gl.createShader(gl.VERTEX_SHADER);
				break;
			case 'x-shader/x-fragment':
				shader = gl.createShader(gl.FRAGMENT_SHADER);
				break;
			default:
				return;
		}

		gl.shaderSource(shader, scriptElement.text);
		gl.compileShader(shader);

		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			return shader;
		} else {
			console.log(gl.getShaderInfoLog(shader));
		}
	}

	function create_program (vs, fs) {
		var program = gl.createProgram();

		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);

		if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
			gl.useProgram(program);
			return program;
		} else {
			console.log(gl.getProgramInfoLog(program));
		}
	}

	function create_vbo(data) {
		var vbo = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
		return vbo;
	}

	function set_attribute(vbo, attL, attS) {
		for(var i in vbo) {
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
			gl.enableVertexAttribArray(attL[i]);
			gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
		}
	}

	function create_ibo(data) {
		var ibo = gl.createBuffer();

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		return ibo;
	}
};
