uniform sampler2D envMap;
uniform sampler2D backfaceMap;
uniform vec2 resolution;

varying vec3 worldNormal;
varying vec3 viewDirection;

float ior = 1.5;
float a = 0.3;

float fresnelFunc(vec3 viewDirection, vec3 worldNormal, float bias, float power, float scale) {
	float fresnelTerm = bias + scale * pow( 1.0 + dot( viewDirection, worldNormal), power );
	return clamp(fresnelTerm, 0.0, 1.0);
}

void main() {
	vec2 uv = gl_FragCoord.xy / resolution;

	vec3 backfaceNormal = texture2D(backfaceMap, uv).rgb;

	vec3 normal = worldNormal * (1.0 - a) - backfaceNormal * a;

	vec3 refracted = refract(viewDirection, normal, 1.0/ior);
	uv += refracted.xy;

	vec4 tex = texture2D(envMap, uv);

	float fresnel = fresnelFunc(viewDirection, normal, 0.0, 5.0, 1.0);
	vec4 final = mix(tex, vec4(1.0), fresnel);

	gl_FragColor = final;
}