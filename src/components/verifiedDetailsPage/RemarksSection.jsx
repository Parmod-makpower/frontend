export default function RemarksSection({ remarks, setRemarks }) {
  return (
    <div className="mb-4">
      <label
        htmlFor="remarks"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Remarks
      </label>
      <textarea
        id="remarks"
        rows={3}
        className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
        placeholder="Enter any remarks..."
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
      ></textarea>
    </div>
  );
}
