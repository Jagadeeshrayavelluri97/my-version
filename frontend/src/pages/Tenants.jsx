import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaSearch, FaFilter } from "react-icons/fa";
import { toast } from "react-toastify";
import TenantCard from "../components/TenantCard";
import { useTenants } from "../context/TenantContext";
import { useRooms } from "../context/RoomContext";

const Tenants = () => {
  const { tenants, loading, deleteTenant, fetchTenants } = useTenants();
  const { fetchRooms } = useRooms();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch both tenants and rooms when component mounts
  useEffect(() => {
    const refreshData = async () => {
      console.log("Refreshing tenant and room data...");
      await fetchRooms();
      await fetchTenants();
    };

    refreshData();
  }, [fetchRooms, fetchTenants]);

  const handleDelete = async (id) => {
    await deleteTenant(id);
  };

  // Filter and search tenants
  const filteredTenants = tenants.filter((tenant) => {
    // Search by name, phone, or email
    const matchesSearch =
      searchTerm === "" ||
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.email &&
        tenant.email.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by status
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && tenant.active) ||
      (filterStatus === "inactive" && !tenant.active);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="responsive-container">
        <div className="premium-tenant-loading">
          <div className="premium-tenant-spinner"></div>
          <p className="responsive-text text-gray-600 mt-4">
            Loading tenants...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="responsive-container">
      <div className="responsive-flex-between responsive-mb">
        <h1 className="responsive-title text-gray-800">Tenants</h1>
        <Link to="/tenants/add" className="premium-room-add-btn">
          <FaPlus className="mr-2" /> Add Tenant
        </Link>
      </div>

      {/* Search and Filter Controls */}
      <div className="responsive-card responsive-mb">
        <div className="responsive-flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="responsive-input-with-icon">
              <input
                type="text"
                placeholder="Search by name, phone or email..."
                className="responsive-input w-full pr-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="search-icon" />
            </div>
          </div>

          <div className="flex space-x-2">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Status:</span>
            </div>

            <select
              className="premium-tenant-form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Tenants</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tenant Cards Grid */}
      <div className="tenant-cards-container responsive-grid">
        {filteredTenants.map((tenant) => (
          <TenantCard
            key={tenant._id}
            tenant={tenant}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Show message when no tenants match filters */}
      {filteredTenants.length === 0 && !loading && (
        <div className="responsive-card text-center responsive-mt">
          <p className="responsive-text text-gray-600">
            {tenants.length === 0
              ? "No tenants found. Add your first tenant to get started."
              : "No tenants match your search criteria. Try adjusting your filters."}
          </p>
          {tenants.length === 0 && (
            <Link
              to="/tenants/add"
              className="premium-room-add-btn inline-flex mt-4"
            >
              <FaPlus className="mr-2" /> Add Your First Tenant
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Tenants;
