varying vec3 worldNormal;
varying vec3 worldPosition;

void main() {
	gl_FragColor = vec4(worldNormal, worldPosition.z);
}