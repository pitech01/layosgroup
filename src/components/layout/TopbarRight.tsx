import ProfileDropdown from './ProfileDropdown';

interface TopbarRightProps {
    role: 'instructor' | 'student';
}

const TopbarRight = ({ role }: TopbarRightProps) => {
    return (
        <div className="flex items-center gap-4">
            <ProfileDropdown role={role} />
        </div>
    );
};

export default TopbarRight;
