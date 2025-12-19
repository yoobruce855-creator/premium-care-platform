import { useState, useEffect } from 'react';
import { Check, Crown, Zap, Building2 } from 'lucide-react';
import paymentService from '../services/payment-service';
import '../styles/Subscription.css';

const Subscription = () => {
    const [plans, setPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingPlan, setProcessingPlan] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [plansData, subscriptionData, invoicesData] = await Promise.all([
                paymentService.getPlans(),
                paymentService.getSubscription(),
                paymentService.getInvoices()
            ]);

            setPlans(plansData);
            setCurrentSubscription(subscriptionData);
            setInvoices(invoicesData);
        } catch (error) {
            console.error('Load data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planId) => {
        if (planId === 'free') return;

        setProcessingPlan(planId);
        try {
            const { url } = await paymentService.createCheckout(planId);
            window.location.href = url;
        } catch (error) {
            console.error('Subscribe error:', error);
            alert('결제 처리 중 오류가 발생했습니다.');
            setProcessingPlan(null);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('구독을 취소하시겠습니까?')) return;

        try {
            await paymentService.cancelSubscription();
            alert('구독이 취소되었습니다.');
            loadData();
        } catch (error) {
            console.error('Cancel error:', error);
            alert('구독 취소 중 오류가 발생했습니다.');
        }
    };

    const getPlanIcon = (planId) => {
        switch (planId) {
            case 'basic': return <Zap className="plan-icon" />;
            case 'premium': return <Crown className="plan-icon" />;
            case 'enterprise': return <Building2 className="plan-icon" />;
            default: return null;
        }
    };

    const formatPrice = (price) => {
        if (price === 0) return '무료';
        return `₩${(price / 100).toLocaleString()}/월`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ko-KR');
    };

    if (loading) {
        return (
            <div className="subscription-page">
                <div className="loading">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="subscription-page">
            <div className="subscription-header">
                <h1>구독 관리</h1>
                <p>케어 플랫폼의 모든 기능을 활용하세요</p>
            </div>

            {/* Current Subscription Status */}
            {currentSubscription && currentSubscription.plan !== 'free' && (
                <div className="current-subscription">
                    <div className="subscription-info">
                        <h3>현재 구독: {currentSubscription.plan.toUpperCase()}</h3>
                        <p className={`status ${currentSubscription.status}`}>
                            {currentSubscription.status === 'active' ? '활성' : '비활성'}
                        </p>
                    </div>
                    <button
                        className="btn-cancel"
                        onClick={handleCancelSubscription}
                    >
                        구독 취소
                    </button>
                </div>
            )}

            {/* Subscription Plans */}
            <div className="plans-grid">
                {plans.map((plan) => {
                    const isCurrentPlan = currentSubscription?.plan === plan.id;
                    const isFree = plan.id === 'free';

                    return (
                        <div
                            key={plan.id}
                            className={`plan-card ${isCurrentPlan ? 'current' : ''} ${plan.id === 'premium' ? 'featured' : ''}`}
                        >
                            {plan.id === 'premium' && (
                                <div className="featured-badge">인기</div>
                            )}

                            <div className="plan-header">
                                {getPlanIcon(plan.id)}
                                <h3>{plan.name}</h3>
                                <div className="plan-price">{formatPrice(plan.price)}</div>
                            </div>

                            <ul className="plan-features">
                                {plan.features.map((feature, index) => (
                                    <li key={index}>
                                        <Check size={16} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`btn-subscribe ${isCurrentPlan ? 'current' : ''}`}
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={isCurrentPlan || processingPlan === plan.id || isFree}
                            >
                                {processingPlan === plan.id ? '처리 중...' :
                                    isCurrentPlan ? '현재 플랜' :
                                        isFree ? '현재 무료 플랜' : '구독하기'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Invoice History */}
            {invoices.length > 0 && (
                <div className="invoice-section">
                    <h2>결제 내역</h2>
                    <div className="invoice-list">
                        {invoices.map((invoice) => (
                            <div key={invoice.id} className="invoice-item">
                                <div className="invoice-info">
                                    <span className="invoice-date">
                                        {formatDate(invoice.date)}
                                    </span>
                                    <span className={`invoice-status ${invoice.status}`}>
                                        {invoice.status === 'paid' ? '결제 완료' : '결제 실패'}
                                    </span>
                                </div>
                                <div className="invoice-amount">
                                    ₩{(invoice.amount / 100).toLocaleString()}
                                </div>
                                {invoice.pdfUrl && (
                                    <a
                                        href={invoice.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-download"
                                    >
                                        PDF 다운로드
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscription;
