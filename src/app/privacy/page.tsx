// ============================================================
// 운영자 수정 항목: 아래 값을 실제 사업자 정보로 변경하세요.
// ============================================================
const OPERATOR_INFO = {
  businessName: '[사업자명을 입력하세요]',
  representative: '[대표자명을 입력하세요]',
  contactEmail: '[문의 이메일을 입력하세요]',
  retentionPeriod: '회원 탈퇴 시까지',
  hasThirdPartyProvision: false,
  hasDomesticOutsourcing: false,
  hasOverseasTransfer: false,
  effectiveDate: '2026.06.28',
}
// ============================================================

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">개인정보 처리방침</h1>
      <p className="text-sm text-gray-500 mb-8">시행일: {OPERATOR_INFO.effectiveDate}</p>

      <div className="prose prose-sm max-w-none space-y-8 text-gray-700">

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. 개인정보 처리 목적</h2>
          <p>
            {OPERATOR_INFO.businessName}(이하 &quot;서비스&quot;)는 다음 목적으로 개인정보를 처리합니다.
            처리한 개인정보는 다음 목적 이외의 용도로 사용되지 않으며, 목적이 변경되는 경우에는
            사전에 동의를 받겠습니다.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>회원가입 및 로그인</li>
            <li>예약 요청, 예약 관리 및 확인</li>
            <li>고객 문의 접수 및 응대</li>
            <li>서비스 관련 안내 전달</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. 처리하는 개인정보 항목</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 border-b border-gray-200 font-medium">항목</th>
                  <th className="text-left px-3 py-2 border-b border-gray-200 font-medium">구분</th>
                  <th className="text-left px-3 py-2 border-b border-gray-200 font-medium">용도</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-3 py-2">이메일</td>
                  <td className="px-3 py-2 text-red-600 font-medium">필수</td>
                  <td className="px-3 py-2">로그인, 서비스 안내</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">이름</td>
                  <td className="px-3 py-2 text-red-600 font-medium">필수</td>
                  <td className="px-3 py-2">본인 확인, 예약 관리</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">휴대폰 번호</td>
                  <td className="px-3 py-2 text-gray-500">선택</td>
                  <td className="px-3 py-2">예약 변경 안내, 긴급 연락, 문의 응대 보조</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">예약 요청사항</td>
                  <td className="px-3 py-2 text-gray-500">선택</td>
                  <td className="px-3 py-2">예약 서비스 제공</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">문의 내용</td>
                  <td className="px-3 py-2 text-gray-500">선택</td>
                  <td className="px-3 py-2">문의 응대</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. 개인정보 보유 및 이용 기간</h2>
          <p>
            개인정보는 {OPERATOR_INFO.retentionPeriod} 보관하며, 관련 법령에 따라 보관이 필요한 경우
            해당 기간 동안 보관합니다.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            * 전자상거래 등에서의 소비자 보호에 관한 법률에 따른 거래 기록, 통신비밀보호법에 따른
            통신 사실 확인 자료 등은 관련 법령이 정한 기간 동안 보관될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. 개인정보의 파기</h2>
          <p>
            회원 탈퇴 또는 보유 기간 만료 시 지체 없이 파기합니다. 전자 파일 형태의 정보는
            복구 및 재생이 불가능한 기술적 방법으로 영구 삭제합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. 개인정보의 제3자 제공</h2>
          {OPERATOR_INFO.hasThirdPartyProvision ? (
            <p>[제3자 제공 내용을 기재하세요.]</p>
          ) : (
            <p>서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.</p>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">6. 개인정보 처리업무 위탁 및 국외 이전</h2>
          {OPERATOR_INFO.hasDomesticOutsourcing ? (
            <p>[국내 처리업무 위탁 내용을 기재하세요.]</p>
          ) : (
            <p>현재 개인정보 처리업무를 위탁하고 있지 않습니다.</p>
          )}
          {OPERATOR_INFO.hasOverseasTransfer ? (
            <p className="mt-2">[국외 이전 내용을 기재하세요.]</p>
          ) : (
            <p className="mt-2">개인정보를 국외로 이전하지 않습니다.</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            * 단, 서비스 인프라(Supabase, Vercel 등)가 해외에 서버를 운영하는 경우,
            해당 서비스의 개인정보 처리방침이 적용될 수 있습니다.
            실제 운영 환경에 맞게 수정하세요.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">7. 정보주체의 권리와 행사 방법</h2>
          <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>개인정보 처리 현황 조회 및 열람 요청</li>
            <li>개인정보 정정·삭제 요청</li>
            <li>개인정보 처리 정지 요청</li>
            <li>동의 철회</li>
          </ul>
          <p className="mt-2">
            권리 행사는 아래 문의처로 연락해 주시면 신속하게 처리하겠습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">8. 민감정보 입력 금지 안내</h2>
          <div className="bg-amber-50 border border-amber-200 rounded p-4 text-amber-800">
            <p className="font-medium mb-1">⚠️ 아래 정보는 절대 입력하지 마세요.</p>
            <p>주민등록번호, 계좌번호, 카드번호, 비밀번호, 건강정보 등 민감한 개인정보는
            예약 요청사항, 문의 내용, 기타 입력 필드에 입력하지 마시기 바랍니다.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">9. 개인정보 보호책임자 및 문의</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2"><dt className="text-gray-500">사업자명:</dt><dd>{OPERATOR_INFO.businessName}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500">대표자:</dt><dd>{OPERATOR_INFO.representative}</dd></div>
            <div className="flex gap-2"><dt className="text-gray-500">문의 이메일:</dt><dd>{OPERATOR_INFO.contactEmail}</dd></div>
          </dl>
        </section>

        <div className="border-t pt-4 text-sm text-gray-400">
          <p>이 개인정보 처리방침은 {OPERATOR_INFO.effectiveDate}부터 시행됩니다.</p>
          <p className="mt-1">
            이 템플릿은 법률 자문이 아닙니다. 실제 운영 전 개인정보 처리방침과 동의 문구는
            전문가 검토를 권장합니다.
          </p>
        </div>
      </div>
    </main>
  )
}
