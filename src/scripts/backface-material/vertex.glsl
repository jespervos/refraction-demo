varying vec3 worldNormal;
varying vec3 worldPosition;

void main() {
	vec4 worldPos = modelMatrix * vec4( position, 1.0);
	worldNormal = normalize( modelViewMatrix * vec4(normal, 0.)).xyz;

	worldPosition = normalize(worldPos.xyz) * 0.5 + 0.5;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}