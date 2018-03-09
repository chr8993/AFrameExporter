#pragma strict

public class AFrameExporter extends MonoBehaviour {

	@MenuItem ("AFrameExporter/Export")
	public static function Export() {
		var objects = Resources.FindObjectsOfTypeAll(GameObject);
		var path = "Assets";
		var tHead = path + "/template_head.txt";
		var tAppend = path + "/template_append.txt";
		var tEnd = path + "/template_end.txt";
		var tempHead: TextAsset = AssetDatabase.LoadAssetAtPath(tHead, TextAsset);
		var tempAppend: TextAsset = AssetDatabase.LoadAssetAtPath(tAppend, TextAsset);
		var tempEnd: TextAsset = AssetDatabase.LoadAssetAtPath(tEnd, TextAsset);
		createExportDirectories();
		var objLength = objects.Length;
		var processCount = 0;
		var sceneExt = ".unity";
		var sceneHTML = "";
		var assetsHTML = "";
		ObjExporter.ClearOffsets();
		for(var obj: GameObject in objects) {
			processCount++;
			var message = "Now Processing...";
			message += processCount + "/";
			message += objLength + " items";
			var progress = processCount/objLength;
			EditorUtility.DisplayProgressBar("Progress", message, progress);
			// increment process count to update the overall Progress
			var objPath = AssetDatabase.GetAssetOrScenePath(obj);
			var existsInScene = System.IO.Path.GetExtension(objPath);
			if(existsInScene.Equals(sceneExt)) {
				var meshFilter: MeshFilter = obj.GetComponent(MeshFilter);
				var renderer: Renderer = obj.GetComponent(Renderer);
				var light: Light = obj.GetComponent(Light);
				if(meshFilter && renderer) {
					if(meshFilter.sharedMesh) {
						Debug.Log("Has shared Mesh");
						var nPath = path + "/export/models/";
						nPath += meshFilter.sharedMesh.name + ".obj";
						var p = Application.dataPath + nPath;
						Debug.Log("Exporting: " + nPath);
						if(!System.IO.File.Exists(p)) {
							ObjExporter.MeshToFile(meshFilter, nPath, true);
							AssetDatabase.ImportAsset(nPath);
							var importer: ModelImporter = ModelImporter.GetAtPath(nPath);
							importer.animationType = ModelImporterAnimationType.None;
							AssetDatabase.Refresh();
						}
						var meshName = meshFilter.sharedMesh.name;
						sceneHTML += '<a-entity obj-model="';
						sceneHTML += 'obj: #' + meshName + '_obj;' + outputMaterial(obj, meshName);
						sceneHTML += '" ' + outputScale(obj) + outputRotation(obj);
						sceneHTML += '></a-entity>\n';
						assetsHTML += '<a-asset-item id="' + meshName + '_obj" ';
						assetsHTML += 'src="models/' + meshName + '.obj"></a-asset-item>\n';
						assetsHTML += '<a-asset-item id="' + meshName + '_mtl" ';
						assetsHTML += 'src="images/' + meshName + '.mtl"></a-asset-item>\n';
						// sceneHTML += outputPosition(obj) + '></a-entity>\n';
					}
				}
				else if(light) {
					var typeA = LightType.Directional;
					var typeB = LightType.Point;
					if(light.type == typeA) {
						var forward: Vector3 = -obj.transform.forward;
						Debug.Log("Adding light as well!");
					}
					else if(light.type == typeB) {

					}
				}
			}
		}
		Debug.Log(sceneHTML);
		var libSrc = "https://aframe.io/releases/";
		libSrc += "0.7.0/aframe.min.js";
		var finalOutput = tempHead.text + sceneHTML;
		finalOutput += tempAppend.text + tempEnd.text;
		finalOutput = finalOutput.Replace("&TITLE&", "A-Frame");
		finalOutput = finalOutput.Replace("&LIBRARY&", libSrc);
		finalOutput = finalOutput.Replace("&ASSETS&", assetsHTML);
		finalOutput = finalOutput.Replace("a-scene", 'a-scene stats="true"');
		var outputDir = Application.dataPath + "/export/";
		System.IO.File.WriteAllText(outputDir + "index.html", finalOutput);
		EditorUtility.ClearProgressBar();
	}

	public static function createExportDirectories() {
		 var p = "/export";
		 var d = Application.dataPath;
		 if(!System.IO.Directory.Exists(d + p)) {
			 var c = "Assets";
			 var i = "Assets/export";
			 AssetDatabase.CreateFolder(c, "export");
			 AssetDatabase.CreateFolder(i, "images");
			 AssetDatabase.CreateFolder(i, "models");
       AssetDatabase.Refresh();
		 }
	}

	public static function outputRotation(obj: GameObject) {
		var rotation: Vector3 = obj.transform.rotation.eulerAngles;
		return outputRotation(rotation);
	}

	public static function outputRotation(angles: Vector3) {
		if(angles == Vector3.zero) return "";
		var html = 'rotation="' + angles.x + ' ';
		html += -angles.y + ' ' + angles.z + '" ';
		return html;
	}

	public static function outputScale(obj: GameObject) {
			var scale: Vector3 = obj.transform.lossyScale;
			return outputScale(scale);
	}

	public static function outputScale(scale: Vector3) {
		if(scale == Vector3.one) { return ""; }
		var s = 'scale="' + scale.x + ' ';
		s += scale.y + ' ' + scale.z + '" ';
		return s;
	}

	public static function outputMaterial(obj: GameObject, meshName: String) {
		 var r: Renderer = obj.GetComponent(Renderer);
		 if(!r) return "";
		 if(!r.sharedMaterial) { return ""; }
		 var html = "";
 		 var material = r.sharedMaterial;
		 texturesToFile(r.materials, "Assets/export", meshName);
		 // html  = 'material="shader: standard; ';
		 html += 'mtl: #' + meshName + '_mtl;';
		 // if(material.HasProperty("_Color")) {
			//  html += 'color: #' + ColorToHex(material.color) + '; ';
			//  html += 'opacity: ' + material.color.a + '; ';
		 // }
		 // html += 'side: double; ';
		 // html += '"';


		 // if(material.shader.name == "Standard"
		 // || material.shader.name == "Mobile/Diffuse") {
			//  html = 'material="shader: standard; ';
			//  html += outputTexture(material);
			//  html += 'repeat: ' + material.mainTextureScale.x + '; ';
			//  if(material.HasProperty("_Color")) {
			// 	 html += 'color: #' + ColorToHex(material.color) + '; ';
			// 	 html += 'opacity: ' + material.color.a + '; ';
			//  }
			//  html += 'side: double; ';
			//  html += '"';
		 // }
		 // else {
			//  html = 'material="shader: standard; ';
			//  html += outputTexture(material);
			//  html += 'repeat: ' + material.mainTextureScale.x + '; ';
			//  if(material.HasProperty("_Color")) {
			// 	 html += 'color: #' + ColorToHex(material.color) + '; ';
			// 	 html += 'opacity: ' + material.color.a + '; ';
			//  }
			//  // html += 'metalness: ' + material.GetFloat("_Metallic") + '; ';
			//  // html += 'roughness: ' + (1f - material.GetFloat("_Glossiness")) + '; ';
			//  // html += 'transparent: ' + (material.GetFloat("_Mode") == 3 ? true: false) + '; ';
			//  html += 'side: double; ';
			//  html += '"';
		 // }
		 return html;
	}

	public static function texturesToFile(materials: Material[], folder: String, filename: String) {
		if(materials.Length) {
			var build = "";
			for(var material in materials) {
				var name = material.name.Replace("(Instance)", "");
				name = name.Replace(" ", "");
				build += "\n";
				build += "newmtl " + name + "\n";
				build += "Ka  0.6 0.6 0.6\n";
				build += "Kd  0.6 0.6 0.6\n";
				build += "Ks  0.9 0.9 0.9\n";
				build += "d  1.0\n";
				build += "Ns  0.0\n";
				build += "illum 2\n";
				if(material.GetTexture("_MainTex")) {
					var texture: Texture = material.GetTexture("_MainTex");
					var texPath = AssetDatabase.GetAssetPath(texture);
					var locPath = System.IO.Path.GetFileName(texPath);
					var nPath = folder + "/images/" + locPath;
					if(locPath.Contains(".tga")
					|| locPath.Contains(".TGA")) {
						var pngPath = locPath.Substring(0, locPath.Length - 3) + "png";
						build += "map_Kd " + pngPath;
					} else {
						build += "map_Kd " + locPath;
					}

					if(!System.IO.File.Exists(nPath)) {
						AssetDatabase.CopyAsset(texPath, nPath);
					}
				}
				build += "\n\n\n";
			}

			if(build != "") {
				var output = folder + "/images/";
				var mtlPath = output + filename + ".mtl";
				// build = build.Replace("\n", Environment.NewLine);
				System.IO.File.WriteAllText(mtlPath, build);
				Debug.Log("Creating export/images/" + filename + ".mtl");
			}
		}
	}

	public static function outputTexture(material: Material) {
		var tex: Texture = material.GetTexture("_MainTex");
		if(tex) {
			var i = "Assets/export";
			var texPath = AssetDatabase.GetAssetPath(tex);
			var loc = System.IO.Path.GetFileName(texPath);
			var newPath = i + "/images/" + loc;
			if(!System.IO.File.Exists(newPath)) {
				AssetDatabase.CopyAsset(texPath, newPath);
			}
			return "src: url(images/" + loc + "); ";
		}
		return "";
	}

	public static function HexToColor(hex: String) {
		var r: byte = byte.Parse(hex.Substring(0, 2), System.Globalization.NumberStyles.HexNumber);
		var g: byte = byte.Parse(hex.Substring(2, 2), System.Globalization.NumberStyles.HexNumber);
		var b: byte = byte.Parse(hex.Substring(4, 2), System.Globalization.NumberStyles.HexNumber);
		return new Color32(r, g, b, 255);
	}

	public static function ColorToHex(color: Color32) {
		var hex: String = color.r.ToString("X2");
		hex += color.g.ToString("X2");
		hex += color.b.ToString("X2");
		return hex;
	}

	public static function outputPosition(obj: GameObject) {
		var position: Vector3 = obj.transform.position;
		if(position == Vector3.zero) return "";
		var html = '';
		html += 'position="' + position.x + ' ';
		html += position.y + ' ' + position.z + '" ';
		return html;
	}

}
