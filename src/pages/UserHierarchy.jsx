import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportToExcel = (data, role) => {
  const rows = [];

  if (role === "ADMIN") {
    data.forEach((crm) => {
      rows.push({
        Role: "CRM",
        Name: crm.crm.name,
        PartyName: crm.crm.party_name || "-",
        Mobile: crm.crm.mobile,
        Under_SS: crm.ss_count,
        Under_DS: crm.ss_data.reduce((a, s) => a + s.ds_count, 0),
      });
      crm.ss_data.forEach((ss) => {
        rows.push({
          Role: "→ SS",
          Name: ss.ss.name,
          PartyName: ss.ss.party_name || "-",
          Mobile: ss.ss.mobile,
          Under_DS: ss.ds_count,
        });
        ss.ds_list.forEach((ds) => {
          rows.push({
            Role: "→→ DS",
            Name: ds.name,
            PartyName: ss.ss.party_name || "-",
            Mobile: ds.mobile,
            UserID: ds.user_id,
          });
        });
      });
    });
  } else if (role === "CRM") {
    data.forEach((ss) => {
      rows.push({
        Role: "SS",
        Name: ss.ss.name,
        PartyName: ss.ss.party_name || "-", 
        Mobile: ss.ss.mobile,
        Under_DS: ss.ds_count,
      });
      ss.ds_list.forEach((ds) => {
        rows.push({
          Role: "→ DS",
          Name: ds.name,
          PartyName: ds.party_name || "-", 
          Mobile: ds.mobile,
          UserID: ds.user_id,
        });
      });
    });
  } else if (role === "SS") {
    data.forEach((ds) => {
      rows.push({
        Role: "DS",
        Name: ds.name,
        PartyName: ds.party_name || "-", 
        Mobile: ds.mobile,
        UserID: ds.user_id,
      });
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Hierarchy");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "UserHierarchy.xlsx");
};

const highlightText = (text, term) => {
  if (!term) return text;
  const regex = new RegExp(`(${term})`, "gi");
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: text.replace(regex, "<mark>$1</mark>"),
      }}
    />
  );
};

const UserHierarchyTable = () => {
  const [data, setData] = useState(null);
  const [expandedCRM, setExpandedCRM] = useState({});
  const [expandedSS, setExpandedSS] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/accounts/hierarchy/")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching hierarchy:", err);
        setLoading(false);
      });
  }, []);

  const toggleCRM = (id) =>
    setExpandedCRM((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleSS = (id) =>
    setExpandedSS((prev) => ({ ...prev, [id]: !prev[id] }));

  const matchSearch = (text) =>
    text?.toLowerCase().includes(searchTerm.toLowerCase());

  const filterHierarchy = () => {
    if (!searchTerm) return data;

    const term = searchTerm.toLowerCase();

    if (data.crm_count !== undefined) {
      const filtered = data.data
        .map((crm) => {
          const crmMatch = matchSearch(crm.crm.name) || matchSearch(crm.crm.mobile);
          const filteredSS = crm.ss_data
            .map((ss) => {
              const ssMatch = matchSearch(ss.ss.name) || matchSearch(ss.ss.mobile);
              const filteredDS = ss.ds_list.filter(
                (ds) =>
                  matchSearch(ds.name) ||
                  matchSearch(ds.mobile) ||
                  matchSearch(ds.user_id)
              );
              if (ssMatch || filteredDS.length > 0)
                return { ...ss, ds_list: filteredDS };
              return null;
            })
            .filter(Boolean);

          if (crmMatch || filteredSS.length > 0)
            return { ...crm, ss_data: filteredSS };
          return null;
        })
        .filter(Boolean);

      return { ...data, data: filtered };
    }

    if (data.ss_count !== undefined) {
      const filtered = data.data
        .map((ss) => {
          const ssMatch = matchSearch(ss.ss.name) || matchSearch(ss.ss.mobile);
          const filteredDS = ss.ds_list.filter(
            (ds) =>
              matchSearch(ds.name) ||
              matchSearch(ds.mobile) ||
              matchSearch(ds.user_id)
          );
          if (ssMatch || filteredDS.length > 0)
            return { ...ss, ds_list: filteredDS };
          return null;
        })
        .filter(Boolean);

      return { ...data, data: filtered };
    }

    if (data.ds_list !== undefined) {
      const filteredDS = data.ds_list.filter(
        (ds) =>
          matchSearch(ds.name) ||
          matchSearch(ds.mobile) ||
          matchSearch(ds.user_id)
      );
      return { ...data, ds_list: filteredDS };
    }

    return data;
  };

  const filteredData = filterHierarchy();

  if (loading) return <div className="p-4">⏳ Loading user hierarchy...</div>;

  if (!filteredData) return <div className="p-4 text-red-500">No data found.</div>;

  const isAdmin = filteredData.crm_count !== undefined;
  const isCRM = filteredData.ss_count !== undefined;
  const isSS = filteredData.ds_list !== undefined;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-2xl font-bold text-blue-700">User Hierarchy</h2>
        <input
          type="text"
          placeholder="Search by name or mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-1 rounded shadow text-sm"
        />
      </div>

      <div className="overflow-x-auto">
        {(isAdmin || isCRM || isSS) && (
  <div className="mb-3">
    <button
      onClick={() =>
        exportToExcel(
          isAdmin ? filteredData.data : isCRM ? filteredData.data : filteredData.ds_list,
          isAdmin ? "ADMIN" : isCRM ? "CRM" : "SS"
        )
      }
      className="bg-green-600 text-white px-3 py-1 rounded shadow hover:bg-green-700 text-sm"
    >
      Export to Excel
    </button>
  </div>
)}

        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Role</th>
              <th className="p-2">Name</th>
              <th className="p-2">Mobile</th>
              <th className="p-2">User ID</th>
              <th className="p-2">Total Under</th>
            </tr>
          </thead>
          <tbody>
            {isAdmin &&
              filteredData.data.map((crm) => (
                <React.Fragment key={crm.crm.id}>
                  <tr className="border-t bg-blue-50">
                    <td className="p-2 flex items-center gap-1">
                      <button onClick={() => toggleCRM(crm.crm.id)}>
                        {expandedCRM[crm.crm.id] ? (
                          <IoChevronDown />
                        ) : (
                          <IoChevronForward />
                        )}
                      </button>
                      CRM
                    </td>
                    <td className="p-2">{highlightText(crm.crm.name || "-", searchTerm)}</td>
                    <td className="p-2">{highlightText(crm.crm.mobile, searchTerm)}</td>
                    <td className="p-2">{crm.crm.user_id}</td>
                    <td className="p-2">
                      SS: {crm.ss_count}, DS:{" "}
                      {crm.ss_data.reduce((acc, ss) => acc + ss.ds_count, 0)}
                    </td>
                  </tr>

                  {expandedCRM[crm.crm.id] &&
                    crm.ss_data.map((ss) => (
                      <React.Fragment key={ss.ss.id}>
                        <tr className="border-t bg-purple-50">
                          <td className="p-2 pl-8 flex items-center gap-1">
                            <button onClick={() => toggleSS(ss.ss.id)}>
                              {expandedSS[ss.ss.id] ? (
                                <IoChevronDown />
                              ) : (
                                <IoChevronForward />
                              )}
                            </button>
                            SS
                          </td>
                          <td className="p-2">{highlightText(ss.ss.name || "-", searchTerm)}</td>
                          <td className="p-2">{highlightText(ss.ss.mobile, searchTerm)}</td>
                          <td className="p-2">{ss.ss.user_id}</td>
                          <td className="p-2">DS: {ss.ds_count}</td>
                        </tr>

                        {expandedSS[ss.ss.id] &&
                          ss.ds_list.map((ds) => (
                            <tr className="border-t bg-green-50" key={ds.id}>
                              <td className="p-2 pl-16">DS</td>
                              <td className="p-2">{highlightText(ds.name || "-", searchTerm)}</td>
                              <td className="p-2">{highlightText(ds.mobile, searchTerm)}</td>
                              <td className="p-2">{highlightText(ds.user_id, searchTerm)}</td>
                              <td className="p-2">-</td>
                            </tr>
                          ))}
                      </React.Fragment>
                    ))}
                </React.Fragment>
              ))}

            {isCRM &&
              filteredData.data.map((ss) => (
                <React.Fragment key={ss.ss.id}>
                  <tr className="border-t bg-purple-50">
                    <td className="p-2 flex items-center gap-1">
                      <button onClick={() => toggleSS(ss.ss.id)}>
                        {expandedSS[ss.ss.id] ? (
                          <IoChevronDown />
                        ) : (
                          <IoChevronForward />
                        )}
                      </button>
                      SS
                    </td>
                    <td className="p-2">{highlightText(ss.ss.name || "-", searchTerm)}</td>
                    <td className="p-2">{highlightText(ss.ss.mobile, searchTerm)}</td>
                    <td className="p-2">{highlightText(ss.ss.user_id, searchTerm)}</td>
                    <td className="p-2">DS: {ss.ds_count}</td>
                  </tr>

                  {expandedSS[ss.ss.id] &&
                    ss.ds_list.map((ds) => (
                      <tr className="border-t bg-green-50" key={ds.id}>
                        <td className="p-2 pl-8">DS</td>
                        <td className="p-2">{highlightText(ds.name || "-", searchTerm)}</td>
                        <td className="p-2">{highlightText(ds.mobile, searchTerm)}</td>
                        <td className="p-2">{highlightText(ds.user_id, searchTerm)}</td>
                        <td className="p-2">-</td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}

            {isSS &&
              filteredData.ds_list.map((ds) => (
                <tr className="border-t bg-green-50" key={ds.id}>
                  <td className="p-2">DS</td>
                  <td className="p-2">{highlightText(ds.name || "-", searchTerm)}</td>
                  <td className="p-2">{highlightText(ds.mobile, searchTerm)}</td>
                  <td className="p-2">{highlightText(ds.user_id, searchTerm)}</td>
                  <td className="p-2">-</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserHierarchyTable;
