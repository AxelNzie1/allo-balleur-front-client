import React, { useEffect, useState } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar 
} from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A', '#FF3366', '#33AAFF'];

const VueGlobale = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Utilisateur non authentifié.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`https://allo-bailleur-backend-1.onrender.com/vueglobale`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Erreur lors de la récupération des données");
        const result = await res.json();

        // Convertir promotion_ends_at en Date
        if (result.biens_promus_details) {
          result.biens_promus_details = result.biens_promus_details.map(bien => ({
            ...bien,
            promotion_ends_at: bien.promotion_ends_at ? new Date(bien.promotion_ends_at) : null,
          }));
        }

        setData(result);
      } catch (err) {
        console.error(err);
        setError("Impossible de récupérer les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const formatDate = (date) => date ? new Date(date).toLocaleDateString("fr-FR") : "-";

  if (loading) return <p>Chargement des données...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return <p>Aucune donnée disponible.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Vue Globale de vos activités</h2>

      {/* Statistiques rapides */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, padding: "20px", background: "#FFE9F6", borderRadius: "10px" }}>
          <h4>Statut utilisateur</h4>
          <p>{data.statut}</p>
        </div>
        <div style={{ flex: 1, padding: "20px", background: "#FFE9F6", borderRadius: "10px" }}>
          <h4>Total des biens</h4>
          <p>{data.total_biens}</p>
        </div>

        <div style={{ flex: 1, padding: "20px", background: "#FFE9F6", borderRadius: "10px" }}>
          <h4>Bien le plus populaire</h4>
          <p>{data.bien_populaire?.titre} ({data.bien_populaire?.vues} vues)</p>
        </div>
        <div style={{ flex: 1, padding: "20px", background: "#FFE9F6", borderRadius: "10px" }}>
          <h4>Bien le plus liké</h4>
          <p>{data.bien_plus_like?.titre} ({data.bien_plus_like?.likes} likes)</p>
        </div>
        
        {/* Ajout des statistiques publicitaires */}
        <div style={{ flex: 1, padding: "20px", background: "#FFE9F6", borderRadius: "10px" }}>
          <h4>Publicité la plus cliquée</h4>
          <p>{data.pub_plus_cliquee?.titre || "Aucune"} ({data.pub_plus_cliquee?.clics || 0} clics)</p>
        </div>
        <div style={{ flex: 1, padding: "20px", background: "#FFE9F6", borderRadius: "10px" }}>
          <h4>Vues du numéro</h4>
          <p>{data.number_views} vues</p>
        </div>
        <div style={{ flex: 1, padding: "20px", background: "#FFE9F6", borderRadius: "10px" }}>
          <h4>Signalements</h4>
          <p>{data.signalements} signalement(s)</p>
        </div>
      </div>

      {/* Graphique de répartition des durées de publicités */}
      {data.duree_publicites?.length > 0 && (
        <div style={{ marginTop: "40px", display: "flex", gap: "40px", alignItems: "flex-start" }}>
          <div style={{ flex: 1, height: 300 }}>
            <h3>Répartition des durées de publicités</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.duree_publicites}
                  dataKey="value"
                  nameKey="name"
                  label
                >
                  {data.duree_publicites.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1 }}>
            <h4>Détails des durées publicitaires</h4>
            <p>
              Répartition de vos publicités par durée :<br />
              {data.duree_publicites.map((item, index) => (
                <span key={index}>
                  {item.name} : {item.value} publicité(s)
                  {index < data.duree_publicites.length - 1 ? ", " : "."}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      {/* Line Chart pour Croissance */}
      {data.croissance?.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h3>Croissance des likes et vues</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.croissance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="likes" stroke="#0088FE" />
              <Line type="monotone" dataKey="vues" stroke="#00C49F" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Revenus par mois */}
      {data.revenus_6mois?.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h3>Revenus des 6 derniers mois</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.revenus_6mois}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenus" fill="#AA336A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Répartition des revenus par type */}
      {data.revenus_par_type?.length > 0 && (
        <div style={{ marginTop: "40px", display: "flex", gap: "40px", alignItems: "flex-start" }}>
          <div style={{ flex: 1, height: 300 }}>
            <h3>Répartition des revenus par type</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.revenus_par_type}
                  dataKey="montant"
                  nameKey="type"
                  label
                >
                  {data.revenus_par_type.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1 }}>
            <h4>Détails de la répartition</h4>
            <p>
              Voici la répartition des revenus générés par votre activité :<br />
              {data.revenus_par_type.map((item, index) => (
                <span key={index}>
                  {item.type} : {item.montant} €{index < data.revenus_par_type.length - 1 ? ", " : "."}
                </span>
              ))}
            </p>
            <p>Exemple : annonce mise en avant 30%, bailleur pro 30%, etc.</p>
          </div>
        </div>
      )}

      {/* Répartition des biens promus + descriptions */}
      {data.biens_promus?.length > 0 && (
        <div style={{ marginTop: "40px", display: "flex", gap: "40px", alignItems: "flex-start" }}>
          <div style={{ flex: 1, height: 300 }}>
            <h3>Répartition des biens promus</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.biens_promus}
                  dataKey="value"
                  nameKey="name"
                  label
                >
                  {data.biens_promus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1 }}>
            <h4>Détails des biens promus</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {data.biens_promus_details?.map((bien, index) => (
                <li key={index} style={{ marginBottom: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
                  <strong>{bien.name}</strong> ({bien.type})<br />
                  Fin de promotion : {formatDate(bien.promotion_ends_at)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Maisons réservées */}
      {data.maisons_reservees?.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h3>Maisons réservées</h3>
          <ul>
            {data.maisons_reservees.map((maison, index) => (
              <li key={index}>
                {maison.description} ({maison.type}, {maison.ville}) - 
                Réservé par: {maison.reserve_par || "N/A"} - 
                Jusqu'au {formatDate(maison.reserved_until)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VueGlobale;