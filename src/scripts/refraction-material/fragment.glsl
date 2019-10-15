uniform sampler2D envMap;
uniform sampler2D backfaceMap;
uniform vec2 resolution;

varying vec3 worldNormal;
varying vec3 viewDirection;
varying vec3 worldPosition;

float ior = 2.4;
float a = 0.33;
float diffuse = 0.2;

vec3 fogColor = vec3(1.0);
vec3 reflectionColor = vec3(1.0);

float fresnelFunc(vec3 viewDirection, vec3 worldNormal, float bias, float power, float scale) {
	float fresnelTerm = bias + scale * pow( 1.0 + dot( viewDirection, worldNormal), power );
	return clamp(fresnelTerm, 0.0, 1.0);
}

void main() {
	// screen coordinates
	vec2 uv = gl_FragCoord.xy / resolution;

	// sample backface data from texture
	vec4 backfaceTex = texture2D(backfaceMap, uv);
	vec3 backfaceNormal = backfaceTex.rgb;
	float backfaceDepth = backfaceTex.a;

	float frontfaceDepth = worldPosition.z;

	// combine backface and frontface normal
	vec3 normal = worldNormal * (1.0 - a) - backfaceNormal * a;

	// calculate refraction and apply to uv
	vec3 refracted = refract(viewDirection, normal, 1.0/ior);
	uv += refracted.xy;

	// sample environment texture
	vec4 tex = texture2D(envMap, uv);

	// calculate fresnel
	float fresnel = fresnelFunc(viewDirection, normal, 0.0, 3.0, 1.0);

	// calculate thickness
	vec3 thickness = vec3(frontfaceDepth - backfaceDepth) * 0.1 + 0.9;

	vec4 final = tex;

	// apply local fog
	final.rgb = mix(tex.rgb, fogColor, thickness * diffuse);

	// apply fresnel
	final.rgb = mix(final.rgb, reflectionColor, fresnel);

	gl_FragColor = vec4(final.rgb, 1.0);
	// gl_FragColor = vec4(vec3(thickness), 1.0);
}