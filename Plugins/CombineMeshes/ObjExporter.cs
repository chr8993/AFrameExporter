using UnityEngine;
using System.Collections;
using System.IO;
using System.Text;

public class ObjExporter {

    public static int vertexOffset = 0;
    public static int normalOffset = 0;
    public static int uvOffset = 0;

    public static string SkinnedMeshToString(SkinnedMeshRenderer skinnedMeshRenderer, bool flip_x)
    {
        Mesh m = skinnedMeshRenderer.sharedMesh;
        Material[] mats = skinnedMeshRenderer.sharedMaterials;

        StringBuilder sb = new StringBuilder();

        sb.Append("g ").Append(m.name).Append("\n");
        foreach (Vector3 v in m.vertices)
        {
            sb.Append(string.Format("v {0} {1} {2}\n", (flip_x ? -v.x : v.x), v.y, v.z));
        }
        sb.Append("\n");
        foreach (Vector3 v in m.normals)
        {
            sb.Append(string.Format("vn {0} {1} {2}\n", (flip_x ? -v.x : v.x), (flip_x ? -v.y : v.y), (flip_x ? -v.z : v.z)));
        }
        sb.Append("\n");
        foreach (Vector3 v in m.uv)
        {
            sb.Append(string.Format("vt {0} {1}\n", v.x, v.y));
        }
        for (int material = 0; material < m.subMeshCount; material++)
        {
            string materialInd = material.ToString();
            if(material < 10) {
              materialInd = "0" + materialInd;
            }
            sb.Append("\n");
            sb.Append("g g_" + materialInd).Append("\n");
            sb.Append("usemtl ").Append(mats[material].name).Append("\n");
            // sb.Append("usemap ").Append(mats[material].name).Append("\n");

            int[] triangles = m.GetTriangles(material);
            for (int i = 0; i < triangles.Length; i += 3)
            {
                sb.Append(string.Format("f {0}/{0}/{0} {1}/{1}/{1} {2}/{2}/{2}\n",
                                        triangles[i] + 1, triangles[i + 1] + 1, triangles[i + 2] + 1));
            }
        }
        return sb.ToString();
    }

    public static void SkinnedMeshToFile(SkinnedMeshRenderer skineedMeshRenderer, string filename, bool flip_x = false)
    {
        using (StreamWriter sw = new StreamWriter(filename))
        {
            sw.Write(SkinnedMeshToString(skineedMeshRenderer, flip_x));
        }
    }

    public static void ClearOffsets() {
      vertexOffset = 0;
      normalOffset = 0;
      uvOffset = 0;
    }

    public static string MeshToString(MeshFilter mf, bool flip_x) {
  		Mesh m = mf.sharedMesh;
  		Material[] mats = mf.GetComponent<Renderer>().sharedMaterials;

  		StringBuilder sb = new StringBuilder();

      sb.Append("mtllib " + mf.name + ".mtl\n");
  		sb.Append("g ").Append(mf.name).Append("\n");

      foreach(Vector3 v in m.vertices) {
        Vector3 wv = mf.transform.TransformPoint(v);
  			sb.Append(string.Format("v {0} {1} {2}\n", -wv.x, wv.y, wv.z));
  		}
  		sb.Append("\n");

  		foreach(Vector3 v in m.normals) {
        Vector3 wv = mf.transform.TransformDirection(v);
  			sb.Append(string.Format("vn {0} {1} {2}\n", -wv.x, wv.y, wv.z));
  		}

  		sb.Append("\n");
  		foreach(Vector3 v in m.uv) {
  			sb.Append(string.Format("vt {0} {1}\n", v.x,v.y));
  		}

  		for (int material=0; material < m.subMeshCount; material ++) {
        string materialInd = (material + 1).ToString();

        if((material + 1) < 10) {
          materialInd = "0" + materialInd;
        }

        sb.Append("\n");
        sb.Append("g g_" + materialInd).Append("\n");
  			sb.Append("usemtl ").Append(mats[material].name.Replace("(Instance)", "").Replace(" ", "")).Append("\n");
  			// sb.Append("usemap ").Append(mats[material].name).Append("\n");
        //
  			int[] triangles = m.GetTriangles(material);
  			for (int i=0;i<triangles.Length;i+=3) {

  				sb.Append(string.Format("f {1}/{1}/{1} {0}/{0}/{0} {2}/{2}/{2}\n",
  				                        triangles[i]+1, triangles[i+1]+1, triangles[i+2]+1));
  			}
  		}
      vertexOffset += m.vertices.Length;
      normalOffset += m.normals.Length;
      uvOffset += m.uv.Length;
  		return sb.ToString();
	 }
  //   public static string MeshToString(MeshFilter mf, bool flip_x) {
  // 		Mesh m = mf.sharedMesh;
  // 		Material[] mats = mf.GetComponent<Renderer>().sharedMaterials;
  //
  // 		StringBuilder sb = new StringBuilder();
  //
  //     sb.Append("mtllib " + mf.name + ".mtl\n");
  // 		sb.Append("g ").Append(mf.name).Append("\n");
  //
  //     foreach(Vector3 v in m.vertices) {
  // 			sb.Append(string.Format("v {0} {1} {2}\n", (flip_x ? -v.x : v.x),v.y,v.z));
  // 		}
  // 		sb.Append("\n");
  // 		foreach(Vector3 v in m.normals) {
  // 			sb.Append(string.Format("vn {0} {1} {2}\n",(flip_x ? -v.x : v.x), (flip_x ? v.y : v.y), (flip_x ? v.z : v.z)));
  // 		}
  // 		sb.Append("\n");
  // 		foreach(Vector3 v in m.uv) {
  // 			sb.Append(string.Format("vt {0} {1}\n",v.x,v.y));
  // 		}
  // 		for (int material=0; material < m.subMeshCount; material ++) {
  //       string materialInd = (material + 1).ToString();
  //       if((material + 1) < 10) {
  //         materialInd = "0" + materialInd;
  //       }
  //       sb.Append("\n");
  //       sb.Append("g g_" + materialInd).Append("\n");
  // 			sb.Append("usemtl ").Append(mats[material].name.Replace("(Instance)", "").Replace(" ", "")).Append("\n");
  // 			// sb.Append("usemap ").Append(mats[material].name).Append("\n");
  //       //
  // 			int[] triangles = m.GetTriangles(material);
  // 			for (int i=0;i<triangles.Length;i+=3) {
  // 				sb.Append(string.Format("f {0}/{0}/{0} {1}/{1}/{1} {2}/{2}/{2}\n",
  // 				                        triangles[i]+1, triangles[i+1]+1, triangles[i+2]+1));
  // 			}
  // 		}
  // 		return sb.ToString();
	// }

	public static void MeshToFile(MeshFilter mf, string filename, bool flip_x = false) {
		using (StreamWriter sw = new StreamWriter(filename))
		{
			sw.Write(MeshToString(mf, flip_x));
		}
	}
}
